import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useApp } from '@/context/AppContext';

Chart.register(...registerables);

export default function ReportsPage() {
  const { t, deals, darkMode } = useApp();
  const revRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLCanvasElement>(null);
  const winRef = useRef<HTMLCanvasElement>(null);
  const topRef = useRef<HTMLCanvasElement>(null);
  const chartsRef = useRef<Chart[]>([]);

  useEffect(() => {
    chartsRef.current.forEach(c => c.destroy());
    chartsRef.current = [];
    const textColor = darkMode ? '#8b949e' : '#94a3b8';
    const gridColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const months = ['Jan', 'Feb', 'Mar', 'Apr'];

    if (revRef.current) {
      chartsRef.current.push(new Chart(revRef.current, {
        type: 'line',
        data: { labels: months, datasets: [{ label: 'Revenue', data: [1850000, 2340000, 2100000, 3280000], borderColor: '#0f6fbd', backgroundColor: 'rgba(15,111,189,0.1)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#0f6fbd' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => 'LKR ' + (Number(v) / 1000) + 'K' } }, x: { grid: { display: false }, ticks: { color: textColor } } } }
      }));
    }
    if (stageRef.current) {
      const stages = ['new', 'quoted', 'negotiation', 'won', 'lost'];
      chartsRef.current.push(new Chart(stageRef.current, {
        type: 'doughnut',
        data: { labels: ['New', 'Quoted', 'Negotiation', 'Won', 'Lost'], datasets: [{ data: stages.map(s => deals.filter(d => d.stage === s).length), backgroundColor: ['#0f6fbd', '#7c3aed', '#d97706', '#059669', '#dc2626'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { size: 11 }, padding: 10 } } } }
      }));
    }
    if (winRef.current) {
      chartsRef.current.push(new Chart(winRef.current, {
        type: 'bar',
        data: { labels: months, datasets: [{ label: 'Win Rate %', data: [28, 34, 31, 45], backgroundColor: 'rgba(5,150,105,0.7)', borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => v + '%' }, max: 100 }, x: { grid: { display: false }, ticks: { color: textColor } } } }
      }));
    }
    if (topRef.current) {
      const topDeals = [...deals].filter(d => !['won', 'lost'].includes(d.stage)).sort((a, b) => b.value - a.value).slice(0, 5);
      chartsRef.current.push(new Chart(topRef.current, {
        type: 'bar',
        data: { labels: topDeals.map(d => d.name.split(' ')[0]), datasets: [{ label: 'Deal Value', data: topDeals.map(d => d.value), backgroundColor: ['#0f6fbd', '#7c3aed', '#d97706', '#059669', '#0891b2'], borderRadius: 6 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => 'LKR ' + (Number(v) / 1000) + 'K' } }, y: { grid: { display: false }, ticks: { color: textColor } } } }
      }));
    }
    return () => { chartsRef.current.forEach(c => c.destroy()); };
  }, [darkMode, deals]);

  const stats = [
    { label: 'Avg Deal Value', val: 'LKR 447K', change: '+12%' },
    { label: 'Sales Cycle Avg', val: '18 Days', change: '-3 days' },
    { label: 'Conversion Rate', val: '33%', change: '+5%' },
    { label: 'MRR', val: 'LKR 820K', change: '+22%' },
    { label: 'Churn Rate', val: '2.1%', change: '-0.4%' },
    { label: 'NPS Score', val: '72', change: '+8' },
  ];

  return (
    <div className="max-w-[1100px]">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold font-display text-foreground">{t('reports_title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('reports_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">Revenue by Month (2026)</h3>
          <p className="text-xs text-muted-foreground mb-4">Total LKR revenue collected</p>
          <div className="h-[200px]"><canvas ref={revRef} /></div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">Deals by Stage</h3>
          <p className="text-xs text-muted-foreground mb-4">Current pipeline snapshot</p>
          <div className="h-[200px]"><canvas ref={stageRef} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">Win Rate Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">% deals won per month</p>
          <div className="h-[200px]"><canvas ref={winRef} /></div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">Top Deals by Value</h3>
          <p className="text-xs text-muted-foreground mb-4">Largest active deals (LKR)</p>
          <div className="h-[200px]"><canvas ref={topRef} /></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {stats.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-3.5">
            <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{s.label}</div>
            <div className="text-lg font-extrabold font-display mt-1">{s.val}</div>
            <div className="text-xs font-semibold text-emerald-600">{s.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
