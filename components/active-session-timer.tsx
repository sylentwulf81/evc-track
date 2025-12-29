"use client"

import { useEffect, useState } from "react"
import { differenceInSeconds } from "date-fns"

interface ActiveSessionTimerProps {
    startTime: string
}

export function ActiveSessionTimer({ startTime }: ActiveSessionTimerProps) {
    const [duration, setDuration] = useState("00:00:00")

    useEffect(() => {
        const updateTimer = () => {
            const start = new Date(startTime)
            const now = new Date()
            const diffInSeconds = differenceInSeconds(now, start)

            const hours = Math.floor(diffInSeconds / 3600)
            const minutes = Math.floor((diffInSeconds % 3600) / 60)
            const seconds = diffInSeconds % 60

            const formatted = [
                hours.toString().padStart(2, "0"),
                minutes.toString().padStart(2, "0"),
                seconds.toString().padStart(2, "0"),
            ].join(":")

            setDuration(formatted)
        }

        // Initial update
        updateTimer()

        // Update every second
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [startTime])

    return <span className="font-mono tabular-nums">{duration}</span>
}
