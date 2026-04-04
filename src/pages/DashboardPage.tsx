import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useApp } from '@/context/AppContext';
import { fmtLKR, getStageColor } from '@/lib/helpers';

Chart.register(...registerables);

export default function DashboardPage() {
  const { t, deals, darkMode, openDealModal } = useApp();
  const revChartRef = useRef<HTMLCanvasElement>(null);
  const stageChartRef = useRef<HTMLCanvasElement>(null);
  const chartsRef = useRef<Chart[]>([]);

  const totalPipeline = deals.filter(d => !['won', 'lost'].includes(d.stage)).reduce((s, d) => s + d.value, 0);
  const dealsWon = deals.filter(d => d.stage === 'won').length;
  const totalClosed = deals.filter(d => ['won', 'lost'].includes(d.stage)).length;
  const winRate = totalClosed > 0 ? Math.round((dealsWon / totalClosed) * 100) : 0;
  const activeChats = 6;

  const kpis = [
    { label: t('kpi_pipeline'), value: fmtLKR(totalPipeline), change: '↑ 18%', up: true, border: 'kpi-border-blue' },
    { label: t('kpi_won'), value: String(dealsWon), change: '↑ 2 ' + t('this_month'), up: true, border: 'kpi-border-green' },
    { label: t('kpi_chats'), value: String(activeChats), change: '↑ 3 ' + t('vs_last'), up: true, border: 'kpi-border-gold' },
    { label: t('kpi_winrate'), value: winRate + '%', change: '↑ 5% ' + t('vs_last'), up: true, border: 'kpi-border-red' },
  ];

  const activities = [
    { icon: '💬', color: 'bg-blue-100 dark:bg-blue-900/30', msg: '<b>Nimali Fernando</b> sent a new message', time: '9 min ago' },
    { icon: '🎉', color: 'bg-emerald-100 dark:bg-emerald-900/30', msg: '<b>Deal Won!</b> Priya Wijesinghe paid LKR 95,000', time: '2 hrs ago' },
    { icon: '📋', color: 'bg-amber-100 dark:bg-amber-900/30', msg: '<b>Kumara Silva</b> viewed the quote', time: '3 hrs ago' },
    { icon: '🔔', color: 'bg-purple-100 dark:bg-purple-900/30', msg: 'Reminder: Demo with <b>Kavindi Rajapaksa</b> tomorrow', time: '5 hrs ago' },
  ];

  const stagesList = ['new', 'quoted', 'negotiation', 'won', 'lost'];
  const stageColors: Record<string, string> = { new: '#0f6fbd', quoted: '#7c3aed', negotiation: '#d97706', won: '#059669', lost: '#dc2626' };
  const stageLabels: Record<string, string> = { new: t('col_new'), quoted: t('col_quoted'), negotiation: t('col_neg'), won: t('col_won'), lost: t('col_lost') };

  useEffect(() => {
    chartsRef.current.forEach(c => c.destroy());
    chartsRef.current = [];
    const textColor = darkMode ? '#8b949e' : '#94a3b8';
    const gridColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    if (revChartRef.current) {
      chartsRef.current.push(new Chart(revChartRef.current, {
        type: 'bar',
        data: {
          labels: ['January', 'February', 'March', 'April'],
          datasets: [{ label: 'Revenue', data: [1850000, 2340000, 2100000, 3280000], backgroundColor: ['rgba(15,111,189,0.7)', 'rgba(15,111,189,0.7)', 'rgba(15,111,189,0.7)', 'rgba(34,160,248,0.9)'], borderRadius: 6 }]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => 'LKR ' + (Number(v) / 1000) + 'K' } }, x: { grid: { display: false }, ticks: { color: textColor } } } }
      }));
    }

    if (stageChartRef.current) {
      const counts = stagesList.map(s => deals.filter(d => d.stage === s).length);
      chartsRef.current.push(new Chart(stageChartRef.current, {
        type: 'doughnut',
        data: { labels: stagesList.map(s => stageLabels[s]), datasets: [{ data: counts, backgroundColor: stagesList.map(s => stageColors[s]), borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { size: 11 }, padding: 8 } } } }
      }));
    }

    return () => { chartsRef.current.forEach(c => c.destroy()); };
  }, [darkMode, deals]);

  return (
    <div className="max-w-[1200px]">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold font-display text-foreground">{t('dashboard_title')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('dashboard_subtitle')}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <div key={i} className={`relative bg-card border border-border rounded-lg p-4 overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all ${kpi.border}`}>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{kpi.label}</div>
            <div className="text-2xl font-extrabold font-display text-foreground mt-2 leading-none">{kpi.value}</div>
            <div className={`text-xs font-semibold mt-1.5 ${kpi.up ? 'text-emerald-600' : 'text-destructive'}`}>{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Pipeline Preview + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
        <div className="lg:col-span-3 bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">{t('pipeline_title')}</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {stagesList.map(s => {
              const sDeals = deals.filter(d => d.stage === s);
              const total = sDeals.reduce((a, d) => a + d.value, 0);
              return (
                <div key={s} className="min-w-[140px] bg-background border border-border rounded-lg p-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: stageColors[s] }} />
                    <span className="text-[10px] font-bold uppercase" style={{ color: stageColors[s] }}>{stageLabels[s]}</span>
                    <span className="ml-auto text-[10px] font-bold text-muted-foreground">{sDeals.length}</span>
                  </div>
                  {sDeals.slice(0, 2).map(d => (
                    <div key={d.id} className="bg-background border border-border rounded-md p-2 mb-1.5 cursor-pointer hover:shadow-sm" onClick={() => openDealModal(d.id)}>
                      <div className="text-xs font-semibold text-foreground truncate">{d.name}</div>
                      <div className="text-[11px] font-bold mt-0.5" style={{ color: stageColors[s] }}>{fmtLKR(d.value)}</div>
                    </div>
                  ))}
                  {sDeals.length > 2 && <div className="text-[11px] text-muted-foreground text-center">+{sDeals.length - 2} more</div>}
                  <div className="text-[11px] font-bold mt-2" style={{ color: stageColors[s] }}>{fmtLKR(total)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">{t('recent_activity')}</h3>
          </div>
          <div className="px-4 py-2">
            {activities.map((a, i) => (
              <div key={i} className="flex gap-3 py-2.5 border-b border-border last:border-0">
                <div className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center text-sm flex-shrink-0`}>{a.icon}</div>
                <div>
                  <div className="text-xs text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: a.msg }} />
                  <div className="text-[11px] text-muted-foreground mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">Monthly Revenue (LKR)</h3>
          <p className="text-xs text-muted-foreground mb-4">Jan – Apr 2026</p>
          <canvas ref={revChartRef} height="80" />
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">Deal Stages</h3>
          <p className="text-xs text-muted-foreground mb-4">Current distribution</p>
          <div className="h-[200px]">
            <canvas ref={stageChartRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
