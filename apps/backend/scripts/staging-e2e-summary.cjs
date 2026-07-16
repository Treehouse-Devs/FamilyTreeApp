#!/usr/bin/env node
'use strict'

const fs = require('node:fs')
const path = require('node:path')

const resultsPath = process.argv[2]
const runId = process.env.E2E_RUN_ID
const summaryPath = process.env.GITHUB_STEP_SUMMARY
if (!resultsPath || !runId || !summaryPath) {
  throw new Error('Usage: staging-e2e-summary.cjs RESULTS_JSON with E2E_RUN_ID and GITHUB_STEP_SUMMARY')
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
const tests = []
function collect(suite) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      tests.push({ title: spec.title, outcome: test.status ?? test.results?.[0]?.status ?? 'unknown' })
    }
  }
  for (const child of suite.suites ?? []) collect(child)
}
for (const suite of results.suites ?? []) collect(suite)

const counts = tests.reduce((acc, item) => {
  acc[item.outcome] = (acc[item.outcome] ?? 0) + 1
  return acc
}, {})
const grafana = `https://api-treely.arkaes.dev/log/d/backend-failures/backend-failed-requests?var-environment=staging&var-search=${encodeURIComponent(`e2e-${runId}-`)}`
const lines = [
  '## Staging API e2e',
  '',
  `Run: \`${runId}\``,
  '',
  `Results: ${Object.entries(counts).map(([key, value]) => `${key}=${value}`).join(', ') || 'no tests'}`,
  '',
  `[Open run-filtered failures in Grafana](${grafana})`,
  '',
  `Reports: \`${path.dirname(resultsPath)}\``,
]
fs.appendFileSync(summaryPath, `${lines.join('\n')}\n`)
