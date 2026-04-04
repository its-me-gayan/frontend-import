export interface Deal {
  id: number;
  name: string;
  phone: string;
  company: string;
  value: number;
  stage: string;
  prob: number;
  dueDate: string;
  lastMsg: string;
  tag: string;
  city: string;
  notes: string;
  assignee: string;
  product: string;
}

export interface ChatMessage {
  from: 'me' | 'them';
  text: string;
  time: string;
}

export interface Chat {
  id: number;
  name: string;
  phone: string;
  color: string;
  unread: number;
  time: string;
  messages: ChatMessage[];
}

export interface Invoice {
  id: string;
  client: string;
  company: string;
  amount: number;
  date: string;
  status: 'paid' | 'sent';
  tin: string;
}

export interface Template {
  id: number;
  name: string;
  tag: string;
  lang: string;
  body: string;
}

export const DEALS: Deal[] = [
  { id:1, name:'Kumara Silva', phone:'+94 77 231 4455', company:'Silva Trading Co.', value:485000, stage:'quoted', prob:65, dueDate:'2026-04-15', lastMsg:'ස්තූතිම, ගාස්තු ලැබුණා. සළකා බලන්නම්.', tag:'Retail', city:'Colombo', notes:'Interested in bulk order. Needs 30-day credit terms.', assignee:'Gayan', product:'Web Design Package + SEO' },
  { id:2, name:'Nimali Fernando', phone:'+94 71 889 0023', company:'Fernando Events', value:320000, stage:'negotiation', prob:80, dueDate:'2026-04-10', lastMsg:'Can we finalize the price today?', tag:'Events', city:'Kandy', notes:'Repeat client. Important — do not lose.', assignee:'Gayan', product:'Event Website + Booking System' },
  { id:3, name:'Roshan Jayawardena', phone:'+94 76 554 1122', company:'RJ Construction', value:1250000, stage:'new', prob:30, dueDate:'2026-04-25', lastMsg:'Hello, I need a quote for an ERP system.', tag:'Construction', city:'Gampaha', notes:'Large project. Schedule demo call.', assignee:'Chaminda', product:'Custom ERP System' },
  { id:4, name:'Priya Wijesinghe', phone:'+94 70 123 4567', company:'Priya Beauty', value:95000, stage:'won', prob:100, dueDate:'2026-03-28', lastMsg:'Payment sent! Thanks so much 🙏', tag:'Beauty', city:'Negombo', notes:'Paid in full. Excellent client.', assignee:'Gayan', product:'E-commerce Website' },
  { id:5, name:'Supun Rathnayake', phone:'+94 78 432 9900', company:'Lanka Auto Parts', value:750000, stage:'quoted', prob:55, dueDate:'2026-04-18', lastMsg:'Let me check with my partner first.', tag:'Automotive', city:'Colombo', notes:'Partner needs to approve budget.', assignee:'Gayan', product:'Inventory Management System' },
  { id:6, name:'Dilani Perera', phone:'+94 77 991 3344', company:'Dilani Exports', value:220000, stage:'new', prob:25, dueDate:'2026-05-01', lastMsg:'I found your number from Google. Need website.', tag:'Export', city:'Kalutara', notes:'Cold lead. Follow up in 2 days.', assignee:'Chaminda', product:'Company Website' },
  { id:7, name:'Mahesh Bandara', phone:'+94 71 654 7788', company:'Bandara Hotels', value:980000, stage:'negotiation', prob:70, dueDate:'2026-04-12', lastMsg:'Can you add the booking module too?', tag:'Hospitality', city:'Colombo', notes:'Wants extra features added to proposal.', assignee:'Gayan', product:'Hotel Booking System' },
  { id:8, name:'Tharushi Gunawardena', phone:'+94 76 234 5566', company:'TG Fashion', value:175000, stage:'lost', prob:0, dueDate:'2026-03-20', lastMsg:'ක්ෂමා කරන්න, වෙනත් ආයතනයකින් කළා.', tag:'Fashion', city:'Colombo', notes:'Lost to competitor. Price was too high.', assignee:'Gayan', product:'Online Store' },
  { id:9, name:'Asitha Gunathilake', phone:'+94 70 887 6655', company:'Asitha Farms', value:145000, stage:'won', prob:100, dueDate:'2026-04-02', lastMsg:'Great! Let\'s start the project 🚀', tag:'Agriculture', city:'Kurunegala', notes:'Paid 50% upfront.', assignee:'Chaminda', product:'Farm Management App' },
  { id:10, name:'Kavindi Rajapaksa', phone:'+94 77 776 5544', company:'KR Clinic', value:560000, stage:'quoted', prob:60, dueDate:'2026-04-20', lastMsg:'Doctor wants to see the demo again.', tag:'Healthcare', city:'Galle', notes:'Demo booked for April 8th.', assignee:'Gayan', product:'Clinic Management System' },
];

export const CHATS: Chat[] = [
  { id:1, name:'Kumara Silva', phone:'+94 77 231 4455', color:'#0f6fbd', unread:2, time:'9:42 AM',
    messages:[
      {from:'them', text:'ආයුබෝවන්! ඔබගේ web design package ගැන විස්තර දෙන්නද?', time:'9:30 AM'},
      {from:'me', text:'ආයුබෝවන් Kumara! ඔව්, Basic - Rs.150,000, Pro - Rs.350,000, Premium - Rs.485,000 (+VAT).', time:'9:35 AM'},
      {from:'them', text:'Premium package ගේ features මොනවාද?', time:'9:38 AM'},
      {from:'me', text:'Premium includes: Custom design, 10 pages, SEO setup, WhatsApp chat integration, 1 year support & hosting!', time:'9:40 AM'},
      {from:'them', text:'ස්තූතිම, ගාස්තු ලැබුණා. සළකා බලන්නම්.', time:'9:42 AM'},
    ]
  },
  { id:2, name:'Nimali Fernando', phone:'+94 71 889 0023', color:'#059669', unread:1, time:'9:15 AM',
    messages:[
      {from:'me', text:'Good morning Nimali! Wanted to follow up on our proposal.', time:'8:45 AM'},
      {from:'them', text:'Yes, I was just going to message you! We love it.', time:'9:00 AM'},
      {from:'them', text:'Can we finalize the price today?', time:'9:15 AM'},
    ]
  },
  { id:3, name:'Mahesh Bandara', phone:'+94 71 654 7788', color:'#7c3aed', unread:0, time:'Yesterday',
    messages:[
      {from:'them', text:'Hello! I need a hotel booking system for Bandara Hotels.', time:'Yesterday 2:00 PM'},
      {from:'me', text:'Hi Mahesh! Great to hear from you. I can prepare a detailed proposal.', time:'Yesterday 2:05 PM'},
      {from:'them', text:'Can you add the booking module too?', time:'Yesterday 3:30 PM'},
    ]
  },
  { id:4, name:'Supun Rathnayake', phone:'+94 78 432 9900', color:'#d97706', unread:0, time:'Yesterday',
    messages:[
      {from:'me', text:'Hi Supun! Did you get a chance to discuss the inventory system with your partner?', time:'Yesterday 10:00 AM'},
      {from:'them', text:'Let me check with my partner first.', time:'Yesterday 11:30 AM'},
    ]
  },
  { id:5, name:'Kavindi Rajapaksa', phone:'+94 77 776 5544', color:'#dc2626', unread:3, time:'Yesterday',
    messages:[
      {from:'them', text:'Hello, calling about the clinic system demo.', time:'Yesterday 4:00 PM'},
      {from:'me', text:'Hi Kavindi! Yes, demo is confirmed for April 8th at 10 AM.', time:'Yesterday 4:15 PM'},
      {from:'them', text:'Can we change to 2 PM instead?', time:'Yesterday 4:45 PM'},
      {from:'them', text:'Doctor wants to see the demo again.', time:'Yesterday 5:00 PM'},
    ]
  },
  { id:6, name:'Roshan Jayawardena', phone:'+94 76 554 1122', color:'#0891b2', unread:1, time:'Mon',
    messages:[
      {from:'them', text:'Hello, I need a quote for an ERP system.', time:'Mon 10:00 AM'},
      {from:'me', text:'Hi Roshan! Great. Could you share more details about your business size and requirements?', time:'Mon 10:30 AM'},
    ]
  },
];

export const INVOICES_DATA: Invoice[] = [
  { id:'26APR_BR01_00042', client:'Priya Wijesinghe', company:'Priya Beauty', amount:112100, date:'2026-04-02', status:'paid', tin:'123456789' },
  { id:'26APR_BR01_00041', client:'Asitha Gunathilake', company:'Asitha Farms', amount:171100, date:'2026-04-02', status:'paid', tin:'987654321' },
  { id:'26APR_BR01_00040', client:'Kumara Silva', company:'Silva Trading Co.', amount:572300, date:'2026-04-01', status:'sent', tin:'456789123' },
];

export const TEMPLATES_DATA: Template[] = [
  { id:1, name:'Initial Quote Follow-up', tag:'Follow-up', lang:'EN', body:'Hi {name}! 👋 Thank you for your interest in our services. I\'ve sent over the quote for {product}. Please let me know if you have any questions. Happy to schedule a quick call! 🙏' },
  { id:2, name:'Payment Reminder (Friendly)', tag:'Payment', lang:'EN', body:'Hi {name}! Just a friendly reminder that invoice #{invoice_id} for LKR {amount} is due on {due_date}. You can pay via bank transfer or online. Thank you! 😊' },
  { id:3, name:'Deal Won - Thank You', tag:'Won', lang:'EN', body:'ස්තූතිම {name}! 🎉 We\'re excited to start working on {product} for {company}. Our team will be in touch within 24 hours to begin the project. Thank you for trusting us! 🙏🇱🇰' },
  { id:4, name:'Quote Message (Sinhala)', tag:'Quote', lang:'සිං', body:'ආයුබෝවන් {name}! 👋 ඔබේ ව්‍යාපෘතිය සඳහා ගාස්තු ලැයිස්තුව ඉදිරිපත් කිරීමට ස්තූතියි. {product} සඳහා මිල: LKR {amount} (VAT ඇතුළුව). ඔබට ප්‍රශ්නයක් ඇත්නම් දන්වන්න! 🙏' },
  { id:5, name:'Meeting Reminder', tag:'Meeting', lang:'EN', body:'Hi {name}! This is a reminder that we have a scheduled call tomorrow at {time}. Looking forward to speaking with you about {product}. Please WhatsApp me if you need to reschedule.' },
  { id:6, name:'Quote Message (Tamil)', tag:'Quote', lang:'த', body:'வணக்கம் {name}! 👋 உங்கள் திட்டத்திற்கான மேற்கோள் விவரங்கள்: {product} - LKR {amount} (VAT உட்பட). கேள்விகள் இருந்தால் தொடர்பு கொள்ளுங்கள்! 🙏' },
];

export const FAKE_MESSAGES = [
  { chatId: 2, text: 'Hi! Is the proposal still valid?' },
  { chatId: 3, text: 'When can we schedule the demo call?' },
  { chatId: 6, text: 'ස්තූතිම! ගාස්තු ලැබිලා. හොඳයි.' },
  { chatId: 1, text: 'Can I get a 10% discount? 🙏' },
  { chatId: 5, text: 'Doctor confirmed for tomorrow 10 AM ✅' },
  { chatId: 4, text: 'My partner says okay. Let\'s proceed!' },
];
