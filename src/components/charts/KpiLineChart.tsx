import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg'
import { theme } from '../../constants/theme'
import { AppText } from '../typography/AppText'
import { KpiHistoryPoint } from '../../models/kpiFavoriteModel'

type Props = {
    data: KpiHistoryPoint[]
    color: string
    width: number
    height?: number
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']

function formatYLabel(value: number, unit: string): string {
    if (unit === 'currency') {
        if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
        if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}k`
        return `${Math.round(value)}`
    }
    if (unit === 'percentage') return `${value.toFixed(1)}%`
    if (unit === 'days') return `${value.toFixed(0)}d`
    return value.toFixed(2)
}

export function KpiLineChart({ data, color, width, height = 150 }: Props) {
    const validData = data.filter((d) => d.available && d.value !== null)

    const chart = useMemo(() => {
        if (validData.length < 2) return null

        const values = validData.map((d) => d.value as number)
        const minVal = Math.min(...values)
        const maxVal = Math.max(...values)
        const range = maxVal - minVal || 1

        const padL = 38
        const padR = 8
        const padT = 10
        const padB = 26
        const cw = width - padL - padR
        const ch = height - padT - padB

        const points = validData.map((d, i) => {
            const x = padL + (i / (validData.length - 1)) * cw
            const y = padT + (1 - ((d.value as number) - minVal) / range) * ch
            const month = new Date(d.period_start + 'T00:00:00').getMonth()
            return { x, y, value: d.value as number, label: MONTH_LABELS[month] }
        })

        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
        const areaD = `${pathD} L${points[points.length - 1].x},${padT + ch} L${points[0].x},${padT + ch} Z`

        return {
            points,
            pathD,
            areaD,
            topLabel: { y: padT + 10, value: maxVal },
            botLabel: { y: padT + ch - 2, value: minVal },
            unit: validData[0].unit,
        }
    }, [validData, width, height])

    if (!chart) {
        return (
            <View style={[styles.empty, { height }]}>
                <AppText variant="p" color={theme.colors.text.light}>
                    Ikke nok data endnu
                </AppText>
            </View>
        )
    }

    const { points, pathD, areaD, topLabel, botLabel, unit } = chart

    return (
        <Svg width={width} height={height}>
            <Path d={areaD} fill={color} fillOpacity={0.1} />
            <Path
                d={pathD}
                stroke={color}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {points.map((p, i) => (
                <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />
            ))}
            {points.map((p, i) => (
                <SvgText
                    key={i}
                    x={p.x}
                    y={height - 6}
                    textAnchor="middle"
                    fontSize={9}
                    fill={theme.colors.text.light}
                    fontFamily="System"
                >
                    {p.label}
                </SvgText>
            ))}
            <SvgText
                x={34}
                y={topLabel.y}
                textAnchor="end"
                fontSize={9}
                fill={theme.colors.text.light}
                fontFamily="System"
            >
                {formatYLabel(topLabel.value, unit)}
            </SvgText>
            <SvgText
                x={34}
                y={botLabel.y}
                textAnchor="end"
                fontSize={9}
                fill={theme.colors.text.light}
                fontFamily="System"
            >
                {formatYLabel(botLabel.value, unit)}
            </SvgText>
        </Svg>
    )
}

const styles = StyleSheet.create({
    empty: {
        alignItems: 'center',
        justifyContent: 'center',
    },
})
