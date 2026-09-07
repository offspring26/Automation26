import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts'

const SCHEDULE_COLOR = '#4f7cff'
const DISPATCH_COLOR = '#a3a3a3'

function formatTimeLabel(isoString) {
  const d = new Date(isoString)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const record = payload[0].payload
  return (
    <div className="tooltip">
      <div className="tooltip-title">{formatTimeLabel(record.actual_time_utc)}</div>
      <div>Trigger: {record.trigger === 'schedule' ? 'Scheduled' : 'Manual dispatch'}</div>
      {record.trigger === 'schedule' && (
        <>
          <div>Scheduled for: 03:14 UTC</div>
          <div>Delay: {record.delayMinutesLabel}</div>
        </>
      )}
    </div>
  )
}

export default function App() {
  const [records, setRecords] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}executions.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load data: ${res.status}`)
        return res.json()
      })
      .then(setRecords)
      .catch((err) => setError(err.message))
  }, [])

  const chartData = useMemo(() => {
    if (!records) return []
    return records.map((r) => {
      const delayMinutes = r.delay_seconds != null ? r.delay_seconds / 60 : null
      return {
        ...r,
        delayMinutes,
        delayMinutesLabel:
          delayMinutes != null ? `${delayMinutes.toFixed(1)} min` : 'n/a',
        label: formatTimeLabel(r.actual_time_utc),
      }
    })
  }, [records])

  const scheduledOnly = chartData.filter((r) => r.trigger === 'schedule')

  const stats = useMemo(() => {
    if (!scheduledOnly.length) return null
    const delays = scheduledOnly.map((r) => r.delayMinutes)
    const avg = delays.reduce((a, b) => a + b, 0) / delays.length
    const max = Math.max(...delays)
    const min = Math.min(...delays)
    return { avg, max, min, count: scheduledOnly.length }
  }, [scheduledOnly])

  return (
    <div className="page">
      <header>
        <h1>Automation26 — Execution Timing</h1>
        <p className="subtitle">
          Target: every day at <strong>03:14 UTC</strong>. Bars show how many
          minutes late each scheduled run actually started. Manual
          (workflow_dispatch) runs are shown in grey with no delay measured.
        </p>
      </header>

      {error && <div className="error">Couldn't load execution data: {error}</div>}

      {!error && !records && <div className="loading">Loading execution log…</div>}

      {records && records.length === 0 && (
        <div className="empty">
          No executions recorded yet. Once the scheduled workflow runs (or is
          dispatched manually), data will appear here.
        </div>
      )}

      {stats && (
        <div className="stats">
          <div className="stat">
            <span className="stat-value">{stats.count}</span>
            <span className="stat-label">scheduled runs</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.avg.toFixed(1)}m</span>
            <span className="stat-label">avg delay</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.min.toFixed(1)}m</span>
            <span className="stat-label">min delay</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.max.toFixed(1)}m</span>
            <span className="stat-label">max delay</span>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={chartData} margin={{ top: 16, right: 16, left: 8, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis
                dataKey="label"
                angle={-40}
                textAnchor="end"
                interval={0}
                height={80}
                tick={{ fontSize: 11, fill: '#999' }}
              />
              <YAxis
                label={{ value: 'Delay (minutes)', angle: -90, position: 'insideLeft', fill: '#999' }}
                tick={{ fontSize: 11, fill: '#999' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                payload={[
                  { value: 'Scheduled run', type: 'square', color: SCHEDULE_COLOR },
                  { value: 'Manual dispatch (no delay measured)', type: 'square', color: DISPATCH_COLOR },
                ]}
              />
              <Bar dataKey="delayMinutes" name="Delay (minutes)">
                {chartData.map((entry, i) => (
                  <Cell
                    key={entry.run_id || i}
                    fill={entry.trigger === 'schedule' ? SCHEDULE_COLOR : DISPATCH_COLOR}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
