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

function formatDateLabel(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const record = payload[0].payload
  return (
    <div className="tooltip" role="status">
      <div className="tooltip-title">{formatDateLabel(record.actual_time_utc)}</div>
      <div className="tooltip-time">{formatTimeLabel(record.actual_time_utc)}</div>
      <div className="tooltip-row">
        <span>Trigger</span>
        <strong>{record.trigger === 'schedule' ? 'Scheduled' : 'Manual dispatch'}</strong>
      </div>
      {record.trigger === 'schedule' && (
        <>
          <div className="tooltip-row">
            <span>Scheduled for</span>
            <strong>03:14 UTC</strong>
          </div>
          <div className="tooltip-row">
            <span>Delay</span>
            <strong>{record.delayMinutesLabel}</strong>
          </div>
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
  const manualCount = chartData.length - scheduledOnly.length

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
      <header className="hero">
        <div>
          <p className="eyebrow">AUTOMATION26 / OPERATIONS</p>
          <h1>Execution timing</h1>
          <p className="subtitle">
            A daily view of how reliably the scheduled workflow starts at its
            03:14 UTC target.
          </p>
        </div>
        <div className="schedule-badge">
          <span className="status-dot" />
          <span>Daily schedule</span>
          <strong>03:14 UTC</strong>
        </div>
      </header>

      <section className="intro-panel" aria-label="Dashboard summary">
        <div>
          <span className="panel-kicker">RUN HISTORY</span>
          <p>
            Bars show the delay before each scheduled run started. Manual
            workflow dispatches are retained for context and shown in grey.
          </p>
        </div>
        {records && (
          <span className="record-count">
            {records.length} {records.length === 1 ? 'record' : 'records'}
          </span>
        )}
      </section>

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
          <div className="stat stat-muted">
            <span className="stat-value">{manualCount}</span>
            <span className="stat-label">manual runs</span>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <section className="chart-card" aria-label="Execution delay chart">
          <div className="chart-heading">
            <div>
              <h2>Delay by execution</h2>
              <p>Minutes between the target and actual start time</p>
            </div>
            <div className="chart-key">
              <span><i className="key-swatch scheduled" /> Scheduled</span>
              <span><i className="key-swatch manual" /> Manual</span>
            </div>
          </div>
          <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={Math.max(360, chartData.length * 48)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 12, right: 24, left: 12, bottom: 28 }}
              barCategoryGap="28%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#29303d" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#8490a3' }}
                axisLine={{ stroke: '#394354' }}
                tickLine={false}
                label={{ value: 'Delay (minutes)', position: 'bottom', fill: '#8490a3', fontSize: 11 }}
              />
              <YAxis
                dataKey="label"
                type="category"
                width={132}
                tick={{ fontSize: 11, fill: '#b7c0cf' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
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
        </section>
      )}
    </div>
  )
}
