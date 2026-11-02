export function formatTimeLabel(isoString) {
  const d = new Date(isoString)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateLabel(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function filterRecordsByRange(records, range) {
  if (!records || !records.length) return []
  if (range === 'ALL') return records

  const days = range === '7D' ? 7 : range === '30D' ? 30 : range === '90D' ? 90 : 30
  const latestTimestamp = new Date(records[records.length - 1].actual_time_utc).getTime()
  const cutoffTime = latestTimestamp - days * 24 * 60 * 60 * 1000

  return records.filter((r) => new Date(r.actual_time_utc).getTime() >= cutoffTime)
}

export function calculateRollingAverage(records, windowSize = 7) {
  if (!records) return []
  const scheduledDelays = []

  return records.map((r) => {
    const delayMinutes = r.delay_seconds != null ? r.delay_seconds / 60 : null
    let rollingAvgMinutes = null

    if (r.trigger === 'schedule' && delayMinutes != null) {
      scheduledDelays.push(delayMinutes)
      const window = scheduledDelays.slice(-windowSize)
      const sum = window.reduce((a, b) => a + b, 0)
      rollingAvgMinutes = Number((sum / window.length).toFixed(1))
    }

    return {
      ...r,
      delayMinutes,
      delayMinutesLabel:
        delayMinutes != null ? `${delayMinutes.toFixed(1)} min` : 'n/a',
      rollingAvgMinutes,
      label: formatTimeLabel(r.actual_time_utc),
    }
  })
}

export function computeStats(records) {
  if (!records || !records.length) return null
  const scheduledOnly = records.filter((r) => r.trigger === 'schedule')
  const manualCount = records.length - scheduledOnly.length

  if (!scheduledOnly.length) {
    return {
      avg: 0,
      max: 0,
      min: 0,
      count: 0,
      manualCount,
      trend: '±0.0m',
      trendDirection: 'steady',
      latestDelay: null,
    }
  }

  const delays = scheduledOnly
    .map((r) => (r.delay_seconds != null ? r.delay_seconds / 60 : null))
    .filter((d) => d != null)

  const avg = delays.reduce((a, b) => a + b, 0) / delays.length
  const max = Math.max(...delays)
  const min = Math.min(...delays)

  let trend = '±0.0m'
  let trendDirection = 'steady'

  if (delays.length >= 2) {
    const recent = delays.slice(-7)
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length

    let trendDiff = 0
    if (delays.length > 7) {
      const prev = delays.slice(-14, -7)
      const prevAvg = prev.reduce((a, b) => a + b, 0) / prev.length
      trendDiff = recentAvg - prevAvg
    } else {
      trendDiff = delays[delays.length - 1] - avg
    }

    if (trendDiff > 0.5) {
      trend = `+${trendDiff.toFixed(1)}m`
      trendDirection = 'up'
    } else if (trendDiff < -0.5) {
      trend = `${trendDiff.toFixed(1)}m`
      trendDirection = 'down'
    } else {
      trend = '±0.0m'
      trendDirection = 'steady'
    }
  }

  const latestScheduled = scheduledOnly[scheduledOnly.length - 1]
  const latestDelay =
    latestScheduled.delay_seconds != null
      ? latestScheduled.delay_seconds / 60
      : null

  return {
    avg,
    max,
    min,
    count: scheduledOnly.length,
    manualCount,
    trend,
    trendDirection,
    latestDelay,
  }
}

export function getHealthStatus(stats) {
  if (!stats || stats.latestDelay == null) {
    return {
      status: 'unknown',
      label: 'Schedule Active',
      sublabel: '03:14 UTC Daily',
      color: '#45d19a',
      glow: 'rgba(69, 209, 154, 0.15)',
    }
  }

  const delay = stats.latestDelay
  if (delay < 5) {
    return {
      status: 'healthy',
      label: 'Healthy',
      sublabel: `Last delay ${delay.toFixed(1)}m`,
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.2)',
    }
  }
  if (delay <= 15) {
    return {
      status: 'moderate',
      label: 'Moderate Delay',
      sublabel: `Last delay ${delay.toFixed(1)}m`,
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.2)',
    }
  }
  return {
    status: 'elevated',
    label: 'Elevated Delay',
    sublabel: `Last delay ${delay.toFixed(1)}m`,
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.2)',
  }
}
