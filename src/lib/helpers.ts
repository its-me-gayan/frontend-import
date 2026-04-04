export function fmtLKR(n: number): string {
  return 'LKR ' + n.toLocaleString('en-LK');
}

export function getInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

export function getStageColor(stage: string): string {
  const colors: Record<string, string> = { new: '#0f6fbd', quoted: '#7c3aed', negotiation: '#d97706', won: '#059669', lost: '#dc2626' };
  return colors[stage] || '#94a3b8';
}

export function getProbBadge(prob: number): string {
  if (prob >= 75) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (prob >= 50) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  if (prob > 0) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
}

export function numberToWords(n: number): string {
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  if (n === 0) return 'Zero';
  if (n < 0) return 'Minus ' + numberToWords(-n);
  let str = '';
  if (n >= 1000000) { str += numberToWords(Math.floor(n / 1000000)) + ' Million '; n %= 1000000; }
  if (n >= 100000) { str += numberToWords(Math.floor(n / 100000)) + ' Hundred Thousand '; n %= 100000; }
  if (n >= 1000) { str += numberToWords(Math.floor(n / 1000)) + ' Thousand '; n %= 1000; }
  if (n >= 100) { str += numberToWords(Math.floor(n / 100)) + ' Hundred '; n %= 100; }
  if (n >= 20) { str += b[Math.floor(n / 10)] + ' '; n %= 10; }
  if (n > 0) { str += a[n] + ' '; }
  return str.trim();
}

export function getLKRWords(n: number): string {
  return numberToWords(Math.floor(n)) + ' Rupees Only';
}

export function genInvoiceSerial(count: number): string {
  const now = new Date();
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const yy = String(now.getFullYear()).slice(2);
  const mon = months[now.getMonth()];
  const seq = String(Math.floor(Math.random() * 90 + 10)).padStart(2, '0');
  const num = String(count + 1).padStart(5, '0');
  return `${yy}${mon}_BR${seq}_${num}`;
}

export function todayStr(): string {
  return new Date().toLocaleDateString('en-LK', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatPhoneForApi(phone: string): string {
  return phone.replace(/[\s\-\+]/g, '');
}
