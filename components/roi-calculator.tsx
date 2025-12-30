"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ChargingSession } from "@/lib/storage"
import { useLanguage } from "@/contexts/LanguageContext"
import { TrendingUp, DollarSign, Zap } from "lucide-react"

interface ROICalculatorProps {
  sessions: ChargingSession[]
}

export function ROICalculator({ sessions }: ROICalculatorProps) {
  const { t } = useLanguage()

  // User inputs
  const [gasPrice, setGasPrice] = useState("")
  const [gasMileage, setGasMileage] = useState("")
  const [evMileage, setEvMileage] = useState("")
  const [milesPerYear, setMilesPerYear] = useState("")

  // Calculate total EV cost from sessions
  const totalEvCost = useMemo(() => {
    return sessions.reduce((sum, s) => sum + (s.cost || 0), 0)
  }, [sessions])

  // Calculate total kWh from sessions
  const totalKwh = useMemo(() => {
    return sessions.reduce((sum, s) => sum + (s.kwh || 0), 0)
  }, [sessions])

  // Calculate total miles driven (if odometer data available)
  const totalMiles = useMemo(() => {
    const odometerData = sessions
      .filter(s => s.odometer)
      .map(s => s.odometer!)
      .sort((a, b) => a - b)
    
    if (odometerData.length < 2) return null
    
    return odometerData[odometerData.length - 1] - odometerData[0]
  }, [sessions])

  // Calculate ROI
  const roi = useMemo(() => {
    const gasPriceNum = parseFloat(gasPrice)
    const gasMileageNum = parseFloat(gasMileage)
    const evMileageNum = parseFloat(evMileage)
    const milesPerYearNum = parseFloat(milesPerYear)

    if (!gasPriceNum || !gasMileageNum || !evMileageNum || !milesPerYearNum) {
      return null
    }

    // Calculate annual costs
    const annualGasCost = (milesPerYearNum / gasMileageNum) * gasPriceNum
    
    // Calculate EV cost per mile/kwh
    let evCostPerMile = 0
    if (totalMiles && totalMiles > 0 && totalEvCost > 0) {
      // Use actual cost per mile from data
      evCostPerMile = totalEvCost / totalMiles
    } else if (totalKwh > 0 && totalEvCost > 0) {
      // Use cost per kWh and efficiency
      const costPerKwh = totalEvCost / totalKwh
      evCostPerMile = costPerKwh / evMileageNum
    } else {
      // Fallback: assume average rate
      return null
    }
    
    const annualEvCost = evCostPerMile * milesPerYearNum

    // Calculate savings
    const annualSavings = annualGasCost - annualEvCost
    const savingsPercent = (annualSavings / annualGasCost) * 100

    return {
      annualGasCost,
      annualEvCost,
      annualSavings,
      savingsPercent,
    }
  }, [gasPrice, gasMileage, evMileage, milesPerYear, totalEvCost, totalKwh, totalMiles])

  const formatCurrency = (amount: number) => {
    // Use JPY symbol as default
    return `¥${Math.round(amount).toLocaleString()}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('analytics.roiCalculator') || "EV vs Gas ROI Calculator"}
        </CardTitle>
        <CardDescription>
          {t('analytics.roiCalculatorDesc') || "Compare your EV charging costs with estimated gas costs"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="gas-price">
              {t('analytics.gasPrice') || "Gas Price"} ({t('analytics.perGallon') || "per gallon/L"})
            </Label>
            <Input
              id="gas-price"
              type="number"
              placeholder="e.g. 150"
              value={gasPrice}
              onChange={(e) => setGasPrice(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gas-mileage">
              {t('analytics.gasMileage') || "Gas Vehicle MPG/km per L"}
            </Label>
            <Input
              id="gas-mileage"
              type="number"
              placeholder="e.g. 30"
              value={gasMileage}
              onChange={(e) => setGasMileage(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ev-mileage">
              {t('analytics.evMileage') || "EV Efficiency"} (miles/kWh or km/kWh)
            </Label>
            <Input
              id="ev-mileage"
              type="number"
              placeholder="e.g. 4"
              value={evMileage}
              onChange={(e) => setEvMileage(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="miles-per-year">
              {t('analytics.milesPerYear') || "Annual Miles/km"}
            </Label>
            <Input
              id="miles-per-year"
              type="number"
              placeholder="e.g. 12000"
              value={milesPerYear}
              onChange={(e) => setMilesPerYear(e.target.value)}
            />
          </div>
        </div>

        {/* Current EV Stats */}
        {(totalEvCost > 0 || totalKwh > 0) && (
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <div className="text-sm font-medium">{t('analytics.currentEvStats') || "Your Current EV Stats"}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('analytics.totalSpent') || "Total Spent"}:</span>
                <div className="font-semibold">{formatCurrency(totalEvCost)}</div>
              </div>
              {totalKwh > 0 && (
                <div>
                  <span className="text-muted-foreground">{t('forms.kwhAdded') || "Total kWh"}:</span>
                  <div className="font-semibold">{totalKwh.toFixed(1)} kWh</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Section */}
        {roi && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-destructive" />
                    {t('analytics.annualGasCost') || "Annual Gas Cost"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(roi.annualGasCost)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    {t('analytics.annualEvCost') || "Annual EV Cost"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(roi.annualEvCost)}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {t('analytics.annualSavings') || "Annual Savings"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{formatCurrency(roi.annualSavings)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t('analytics.savingsPercent') || "Savings"}: {roi.savingsPercent.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!roi && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {t('analytics.enterValues') || "Enter values above to calculate ROI"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

