import { Suspense } from "react"
import { ChargingTracker } from "@/components/charging-tracker"

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChargingTracker />
    </Suspense>
  )
}
