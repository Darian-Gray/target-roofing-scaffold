import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const source = fs.readFileSync(path.join(testDir, '../src/lib/chat-lead-marker.ts'), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const markerModule = { exports: {} }
vm.runInNewContext(compiled, { module: markerModule, exports: markerModule.exports })
const { extractChatLeadMarkers } = markerModule.exports

test('extracts a multiline lead with a closing bracket inside a field', () => {
  const lead = {
    firstName: 'Taylor', lastName: 'Rivera', email: 'taylor@example.com',
    phone: '239-332-5707', address: '12 Main St [Unit 4]',
    roofType: 'tile', issue: 'Leak above [bedroom] ceiling',
  }
  const text = `I have your details.\n[SUBMIT_LEAD:\n${JSON.stringify(lead, null, 2)}\n]`
  const { markers, cleanText } = extractChatLeadMarkers(text)

  assert.equal(markers.length, 1)
  assert.deepEqual(JSON.parse(markers[0].json), lead)
  assert.equal(cleanText, 'I have your details.')
})

test('quoted braces and escaped characters do not end the marker early', () => {
  const lead = { issue: 'Water near "{vent}" and \\flashing [west]' }
  const text = `Submitted [SUBMIT_LEAD:${JSON.stringify(lead)}] Thank you.`
  const { markers, cleanText } = extractChatLeadMarkers(text)

  assert.equal(markers.length, 1)
  assert.deepEqual(JSON.parse(markers[0].json), lead)
  assert.equal(cleanText, 'Submitted  Thank you.')
})

test('removes every complete marker and preserves normal chat text', () => {
  const text = 'First [SUBMIT_LEAD:{"firstName":"A"}] then [SUBMIT_LEAD:{"firstName":"B"}] done.'
  const { markers, cleanText } = extractChatLeadMarkers(text)

  assert.equal(markers.length, 2)
  assert.equal(JSON.parse(markers[0].json).firstName, 'A')
  assert.equal(JSON.parse(markers[1].json).firstName, 'B')
  assert.equal(cleanText, 'First  then  done.')
  assert.equal(extractChatLeadMarkers('No lead here.').cleanText, 'No lead here.')
})
