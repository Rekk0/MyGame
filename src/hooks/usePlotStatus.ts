import { useCallback, useEffect, useState } from 'react'

interface PlotStatus {
  eligible: boolean
  cached?: string
}

export function usePlotStatus(): {
  daily: PlotStatus
  weekly: PlotStatus
  refresh: () => void
} {
  const [daily, setDaily] = useState<PlotStatus>({ eligible: false })
  const [weekly, setWeekly] = useState<PlotStatus>({ eligible: false })

  const fetch = useCallback(() => {
    window.plotAPI.getDailyStatus().then(setDaily).catch(() => {})
    window.plotAPI.getWeeklyStatus().then(setWeekly).catch(() => {})
  }, [])

  useEffect(() => {
    fetch()
    return window.dataAPI.onUpdated(() => fetch())
  }, [fetch])

  return { daily, weekly, refresh: fetch }
}
