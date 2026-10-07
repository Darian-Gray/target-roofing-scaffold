import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const testDir = path.dirname(fileURLToPath(import.meta.url))

test('ops routes can load without a service-role key, but database use fails closed', () => {
  const source = fs.readFileSync(path.join(testDir, '../src/lib/ops/db.ts'), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const env = {}
  let creations = 0
  const tables = []
  const client = {
    from(table) { assert.equal(this, client); tables.push(table); return table },
    storage: { from: (bucket) => bucket },
  }
  const opsModule = { exports: {} }
  vm.runInNewContext(compiled, {
    module: opsModule,
    exports: opsModule.exports,
    require: (name) => {
      if (name === 'server-only') return {}
      if (name === '@supabase/supabase-js') return {
        createClient: (_url, key) => { creations++; assert.equal(key, 'test-service-key'); return client },
      }
      throw new Error(`Unexpected import: ${name}`)
    },
    process: { env },
  }, { filename: 'ops-db.js' })

  assert.equal(creations, 0, 'module loading must not require credentials')
  assert.throws(() => opsModule.exports.db.from('tasks'), /SUPABASE_SERVICE_ROLE_KEY is required/)
  assert.throws(() => opsModule.exports.db.storage, /SUPABASE_SERVICE_ROLE_KEY is required/)
  assert.equal(creations, 0, 'missing credentials must never create a weaker client')

  env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  assert.equal(opsModule.exports.db.from('tasks'), 'tasks')
  assert.equal(opsModule.exports.db.storage.from('meetings'), 'meetings')
  assert.equal(opsModule.exports.db.from('team_members'), 'team_members')
  assert.equal(creations, 1, 'service-role client should be reused')
  assert.deepEqual(tables, ['tasks', 'team_members'])
})
