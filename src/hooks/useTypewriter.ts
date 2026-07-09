import { useEffect, useRef, useState } from 'react'

/** 30ms/char typewriter. Returns [displayed, typing, skip]. */
export function useTypewriter(
  text: string | undefined
): [string, boolean, () => void] {
  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!text) {
      setDisplayed('')
      return
    }
    setDisplayed('')
    setTyping(true)
    let i = 0
    function tick() {
      i++
      setDisplayed(text!.slice(0, i))
      if (i < text!.length) {
        timerRef.current = setTimeout(tick, 30)
      } else {
        setTyping(false)
      }
    }
    timerRef.current = setTimeout(tick, 30)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [text])

  const skip = () => {
    if (typing && text) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setDisplayed(text)
      setTyping(false)
    }
  }

  return [displayed, typing, skip]
}
