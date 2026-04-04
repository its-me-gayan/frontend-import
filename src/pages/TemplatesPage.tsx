import { useApp } from '@/context/AppContext';
import { TEMPLATES_DATA } from '@/data/mockData';

export default function TemplatesPage() {
  const { t, showToast } = useApp();

  return (
    <div className="max-w-[1000px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold font-display text-foreground">{t('templates_title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('templates_subtitle')}</p>
        </div>
        <button className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
          onClick={() => showToast('Template editor coming soon! 📝', 'info')}>+ New Template</button>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {['All', 'Follow-up', 'Payment', 'Won', 'Quote', 'Meeting'].map(tag => (
          <button key={tag} className="text-[11px] font-semibold border border-border rounded-md px-3 py-1.5 hover:bg-muted transition text-foreground"
            onClick={() => showToast(`Filtering by ${tag}...`, 'info')}>{tag}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES_DATA.map(tpl => (
          <div key={tpl.id} className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{tpl.tag}</span>
              <span className="text-[10px] bg-background px-2 py-0.5 rounded-full text-muted-foreground font-semibold">{tpl.lang}</span>
            </div>
            <div className="text-sm font-bold text-foreground mb-2">{tpl.name}</div>
            <div className="text-xs text-muted-foreground leading-relaxed bg-background p-2.5 rounded-lg border-l-[3px] border-l-emerald-500">
              {tpl.body.slice(0, 120)}{tpl.body.length > 120 ? '...' : ''}
            </div>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 bg-primary text-primary-foreground text-xs font-semibold py-1.5 rounded-md hover:opacity-90 transition"
                onClick={() => showToast('Template copied to clipboard! 📋', 'success')}>{t('use_template')}</button>
              <button className="text-xs font-semibold border border-border rounded-md px-2.5 py-1.5 hover:bg-muted transition"
                onClick={() => showToast('Template saved! ✓', 'success')}>✏️</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-card border border-border rounded-lg">
        <div className="text-sm font-bold text-foreground mb-2">📌 Template Variables</div>
        <div className="flex flex-wrap gap-2">
          {['{name}', '{company}', '{product}', '{amount}', '{invoice_id}', '{due_date}', '{time}', '{date}'].map(v => (
            <code key={v} className="bg-background border border-border px-2.5 py-1 rounded-md text-xs text-primary">{v}</code>
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-2">Use these variables in your templates — they'll be auto-filled when you send to a specific deal.</div>
      </div>
    </div>
  );
}
