import { Bar } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

/** Bar chart — analyses per day (last 7 days) */
export function DashboardBarChart({ data }) {
  const labels  = (data || []).map((d) => d.date)
  const counts  = (data || []).map((d) => d.count)
  const hasData = counts.some((c) => c > 0)

  const chartData = {
    labels,
    datasets: [{
      label: 'Analyses',
      data: counts,
      backgroundColor: 'rgba(0,217,255,0.6)',
      borderColor: '#00d9ff',
      borderWidth: 1,
      borderRadius: 4,
      hoverBackgroundColor: 'rgba(0,217,255,0.9)',
    }],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'hsl(217 25% 10%)',
        titleColor: '#e2e8f0',
        bodyColor: '#8892a4',
        borderColor: 'hsl(220 18% 17%)',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        ticks: { color: '#8892a4', font: { family: 'Inter', size: 11 } },
        grid: { color: 'hsl(220 18% 17% / 0.5)' },
      },
      y: {
        ticks: { color: '#8892a4', font: { family: 'Inter', size: 11 }, stepSize: 1 },
        grid: { color: 'hsl(220 18% 17% / 0.5)' },
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 h-full">
      <p className="text-sm font-semibold text-foreground mb-4">Analyses per Day (7 days)</p>
      {!hasData ? (
        <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">No activity yet</div>
      ) : (
        <div className="h-48">
          <Bar data={chartData} options={{ ...options, maintainAspectRatio: false }} />
        </div>
      )}
    </div>
  )
}
