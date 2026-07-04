import { useEffect, useRef } from 'react'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

Chart.register(ArcElement, Tooltip, Legend)

/** Pie/Doughnut chart showing risk level distribution */
export function DashboardPieChart({ data }) {
  const safeCount  = data?.safe ?? 0
  const reviewCount = data?.needs_review ?? 0
  const suspCount  = data?.suspicious ?? 0
  const total = safeCount + reviewCount + suspCount

  const chartData = {
    labels: ['Safe', 'Needs Review', 'Suspicious'],
    datasets: [{
      data: total > 0 ? [safeCount, reviewCount, suspCount] : [1, 0, 0],
      backgroundColor: ['rgba(57,255,20,0.8)', 'rgba(255,215,0,0.8)', 'rgba(255,51,102,0.8)'],
      borderColor: ['#39ff14', '#ffd700', '#ff3366'],
      borderWidth: 1,
      hoverOffset: 8,
    }],
  }

  const options = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#8892a4',
          font: { family: 'Inter', size: 12 },
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'hsl(217 25% 10%)',
        titleColor: '#e2e8f0',
        bodyColor: '#8892a4',
        borderColor: 'hsl(220 18% 17%)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => {
            const v = ctx.raw
            const pct = total > 0 ? Math.round((v / total) * 100) : 0
            return ` ${v} files (${pct}%)`
          }
        }
      }
    },
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 h-full">
      <p className="text-sm font-semibold text-foreground mb-4">Risk Distribution</p>
      {total === 0 ? (
        <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">No data yet</div>
      ) : (
        <div className="flex items-center justify-center h-48">
          <Doughnut data={chartData} options={options} />
        </div>
      )}
    </div>
  )
}
