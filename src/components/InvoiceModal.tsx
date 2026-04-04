import { useApp } from '@/context/AppContext';
import { fmtLKR, getLKRWords, genInvoiceSerial, todayStr } from '@/lib/helpers';
import { INVOICES_DATA } from '@/data/mockData';

export default function InvoiceModal() {
  const { invoiceModalDealId, deals, closeInvoiceModal, showToast, t } = useApp();
  if (invoiceModalDealId === null) return null;

  const deal = deals.find(d => d.id === invoiceModalDealId);
  if (!deal) return null;

  const serialNo = genInvoiceSerial(INVOICES_DATA.length);
  const subTotal = deal.value;
  const vatAmt = Math.round(subTotal * 0.18);
  const total = subTotal + vatAmt;
  const totalWords = getLKRWords(total);
  const today = new Date().toISOString().slice(0, 10);

  const handlePrint = () => {
    showToast('Invoice sent to printer / PDF! 🖨️', 'success');
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5"
      onClick={e => { if (e.target === e.currentTarget) closeInvoiceModal(); }}>
      <div className="bg-card rounded-2xl w-full max-w-[750px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-extrabold font-display text-foreground">Generate VAT Invoice</h3>
              <p className="text-xs text-muted-foreground">IRD Sri Lanka 2026 Compliant</p>
            </div>
            <button className="text-sm font-semibold border border-border rounded-md px-3 py-1.5 hover:bg-muted transition" onClick={closeInvoiceModal}>✕ Close</button>
          </div>

          {/* Supplier & Purchaser */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase mb-2">{t('inv_supplier')}</div>
              <div className="bg-background rounded-lg p-3.5 space-y-2">
                {[['Business Name', 'Gayan Perera Digital'], ['TIN Number', '134567890V'], ['VAT Reg.', 'VAT-2024-00456'], ['Address', 'No. 45, Galle Road, Colombo 03'], ['Phone', '+94 77 123 4567']].map(([l, v]) => (
                  <div key={l}><label className="text-xs font-semibold text-muted-foreground mb-0.5 block">{l}</label><input className="w-full bg-card border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground outline-none" defaultValue={v} /></div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase mb-2">{t('inv_purchaser')}</div>
              <div className="bg-background rounded-lg p-3.5 space-y-2">
                {[['Client Name', deal.name], ['TIN', 'N/A'], ['Company', deal.company], ['Address', deal.city + ', Sri Lanka'], ['Phone', deal.phone]].map(([l, v]) => (
                  <div key={l}><label className="text-xs font-semibold text-muted-foreground mb-0.5 block">{l}</label><input className="w-full bg-card border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground outline-none" defaultValue={v} /></div>
                ))}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[['Invoice Serial', serialNo], ['Invoice Date', today], ['Place of Supply', deal.city + ', Sri Lanka']].map(([l, v]) => (
              <div key={l}><label className="text-xs font-semibold text-muted-foreground mb-0.5 block">{l}</label><input className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground outline-none font-mono" defaultValue={v} /></div>
            ))}
          </div>

          {/* Line Items */}
          <div className="mb-5">
            <div className="text-xs font-bold text-muted-foreground uppercase mb-2">Line Items</div>
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-border/50">
                    {['#', t('inv_items'), t('inv_qty'), t('inv_unitprice'), t('inv_subtotal')].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2.5 text-sm">1</td>
                    <td className="px-3 py-2.5 text-sm">{deal.product}</td>
                    <td className="px-3 py-2.5 text-sm text-right">1</td>
                    <td className="px-3 py-2.5 text-sm text-right">{subTotal.toLocaleString('en-LK')}</td>
                    <td className="px-3 py-2.5 text-sm font-semibold text-right">{subTotal.toLocaleString('en-LK')}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-border"><td colSpan={4} className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Sub-total (LKR)</td><td className="px-3 py-2 text-right text-xs font-semibold">{subTotal.toLocaleString('en-LK')}</td></tr>
                  <tr><td colSpan={4} className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">{t('inv_vat')}</td><td className="px-3 py-2 text-right text-xs font-semibold text-amber-600">{vatAmt.toLocaleString('en-LK')}</td></tr>
                  <tr className="border-t-2 border-primary bg-brand-50">
                    <td colSpan={4} className="px-3 py-3 text-right text-sm font-extrabold text-primary">{t('inv_total')}</td>
                    <td className="px-3 py-3 text-right text-base font-extrabold font-display text-primary">{total.toLocaleString('en-LK')}</td>
                  </tr>
                  <tr><td colSpan={5} className="px-3 py-2.5 text-xs text-muted-foreground"><b>{t('inv_words')}:</b> {totalWords}</td></tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 flex-wrap pt-4 border-t border-border">
            <button className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition" onClick={handlePrint}>{t('download_pdf')}</button>
            <button className="bg-emerald-500 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-600 transition"
              onClick={() => showToast(`Invoice sent via WhatsApp to ${deal.phone} ✓`, 'success')}>{t('send_wa')}</button>
            <button className="border border-border text-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-muted transition"
              onClick={() => showToast('Invoice saved to records! ✓', 'success')}>💾 Save Invoice</button>
          </div>
        </div>
      </div>
    </div>
  );
}
