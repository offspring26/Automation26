import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatDateLabel,
  formatTimeLabel,
  filterRecordsByRange,
  calculateRollingAverage,
  computeStats,
  getHealthStatus,
} from './analytics.js'

test('formatDateLabel formats ISO string', () => {
  const result = formatDateLabel('2026-11-02T03:14:00Z')
  assert.ok(result.includes('2026') || result.includes('Nov'))
})

test('formatTimeLabel formats ISO string', () => {
  const result = formatTimeLabel('2026-11-02T03:14:00Z')
  assert.ok(typeof result === 'string' && result.length > 0)
})

test('filterRecordsByRange filters by days relative to latest timestamp', () => {
  const sample = [
    { actual_time_utc: '2026-10-01T03:14:00Z', trigger: 'schedule' },
    { actual_time_utc: '2026-10-25T03:14:00Z', trigger: 'schedule' },
    { actual_time_utc: '2026-11-01T03:14:00Z', trigger: 'schedule' },
    { actual_time_utc: '2026-11-02T03:14:00Z', trigger: 'schedule' },
  ]

  assert.equal(filterRecordsByRange(sample, 'ALL').length, 4)
  assert.equal(filterRecordsByRange(sample, '7D').length, 2)
  assert.equal(filterRecordsByRange(sample, '30D').length, 3)
  assert.deepEqual(filterRecordsByRange([], '7D'), [])
  assert.deepEqual(filterRecordsByRange(null, '7D'), [])
  assert.deepEqual(filterRecordsByRange([{ actual_time_utc: 'invalid-date' }], '7D'), [])
})

test('calculateRollingAverage calculates 7-run rolling average', () => {
  const records = [
    { trigger: 'schedule', delay_seconds: 60, actual_time_utc: '2026-11-01T03:15:00Z' },
    { trigger: 'schedule', delay_seconds: 120, actual_time_utc: '2026-11-02T03:16:00Z' },
    { trigger: 'workflow_dispatch', delay_seconds: null, actual_time_utc: '2026-11-02T10:00:00Z' },
  ]
  const result = calculateRollingAverage(records, 2)
  assert.equal(result[0].delayMinutes, 1)
  assert.equal(result[0].rollingAvgMinutes, 1)
  assert.equal(result[1].delayMinutes, 2)
  assert.equal(result[1].rollingAvgMinutes, 1.5)
  assert.equal(result[2].rollingAvgMinutes, null)
})

test('computeStats handles empty and populated records', () => {
  assert.equal(computeStats([]), null)

  const records = [
    { trigger: 'schedule', delay_seconds: 120 },
    { trigger: 'schedule', delay_seconds: 240 },
    { trigger: 'workflow_dispatch', delay_seconds: null },
  ]
  const stats = computeStats(records)
  assert.equal(stats.count, 2)
  assert.equal(stats.manualCount, 1)
  assert.equal(stats.min, 2)
  assert.equal(stats.max, 4)
  assert.equal(stats.avg, 3)
})

test('getHealthStatus categorizes delays appropriately', () => {
  assert.equal(getHealthStatus({ latestDelay: 2.5 }).status, 'healthy')
  assert.equal(getHealthStatus({ latestDelay: 9.0 }).status, 'moderate')
  assert.equal(getHealthStatus({ latestDelay: 22.0 }).status, 'elevated')
  assert.equal(getHealthStatus(null).status, 'unknown')
})
