import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const testDir = path.dirname(fileURLToPath(import.meta.url))

function loadActions() {
  const source = fs.readFileSync(path.join(testDir, '../src/app/actions.ts'), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText

  let databaseCalls = 0
  let authCalls = 0
  const query = {
    select: () => ({ order: async () => ({ data: [], error: null }) }),
  }
  const mocks = {
    '@/lib/supabase': { supabase: { from: () => { databaseCalls++; return query } } },
    '@/lib/ops/session': {
      requireAdmin: async () => { authCalls++; throw new Error('Not signed in') },
      setAdminSession: async () => {},
      clearAdminSession: async () => {},
    },
    '@/lib/notify': { sendNotification: async () => ({ sent: true }), recipientList: () => [] },
  }
  const actionModule = { exports: {} }
  vm.runInNewContext(compiled, {
    module: actionModule,
    exports: actionModule.exports,
    require: (name) => {
      if (!Object.hasOwn(mocks, name)) throw new Error('Unexpected import: ' + name)
      return mocks[name]
    },
    process,
    console,
  }, { filename: 'actions.js' })
  return { actions: actionModule.exports, calls: () => ({ databaseCalls, authCalls }) }
}

test('anonymous callers cannot read leads or run any admin mutation', async () => {
  const { actions, calls } = loadActions()
  const adminActions = [
    ['getLeads', []],
    ['updateLeadStatus', ['lead-id', 'processed']],
    ['addReview', [{ name: 'A', source: 'Google', text: 'Text' }]],
    ['getSeoConfig', []],
    ['updateSeoConfig', ['home', { title: 'T', description: 'D', keywords: 'K' }]],
    ['addShowcaseVideo', [{ id: 'id', title: 'T', description: 'D', duration: '1:00' }]],
    ['removeShowcaseVideo', ['id']],
    ['reorderShowcaseVideos', [[]]],
    ['addJobListing', [{ title: 'T', department: 'D', type: 'Full-Time', location: 'L', description: 'D', requirements: [] }]],
    ['updateJobListing', ['id', { title: 'T' }]],
    ['removeJobListing', ['id']],
    ['toggleJobListing', ['id']],
  ]

  for (const [name, args] of adminActions) {
    await assert.rejects(actions[name](...args), /Not signed in/, name)
  }
  assert.deepEqual(calls(), { databaseCalls: 0, authCalls: adminActions.length })
})

test('public content reads remain available without an admin session', async () => {
  const { actions, calls } = loadActions()
  for (const name of ['getReviews', 'getShowcaseVideos', 'getGalleryVideos', 'getJobListings']) {
    assert.deepEqual(await actions[name](), [], name)
  }
  assert.deepEqual(calls(), { databaseCalls: 4, authCalls: 0 })
})
