type DateInput = Date | string | number
type DateFormat = 'short' | 'medium' | 'long' | 'relative'

export function formatDate(date: DateInput, format: DateFormat = 'medium'): string {
  const d = new Date(date)

  if (format === 'relative') {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    const diffMs = d.getTime() - Date.now()
    const diffSecs = Math.round(diffMs / 1000)
    const diffMins = Math.round(diffSecs / 60)
    const diffHours = Math.round(diffMins / 60)
    const diffDays = Math.round(diffHours / 24)

    if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, 'day')
    if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, 'hour')
    if (Math.abs(diffMins) >= 1) return rtf.format(diffMins, 'minute')
    return rtf.format(diffSecs, 'second')
  }

  const options: Intl.DateTimeFormatOptions =
    format === 'short'
      ? { month: 'numeric', day: 'numeric', year: 'numeric' }
      : format === 'medium'
        ? { month: 'short', day: 'numeric', year: 'numeric' }
        : { month: 'long', day: 'numeric', year: 'numeric' }

  return new Intl.DateTimeFormat('en-US', options).format(d)
}
