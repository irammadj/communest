import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  from: 'user' | 'bot';
  text: string;
}

const FAQS = [
  {
    q: 'How do I find a house?',
    a: 'Go to the Explore page to browse all approved estates. You can filter by county and price range, then click "View Estate" to see available vacant houses.',
  },
  {
    q: 'How do I list my estate?',
    a: 'You need a Communest account. Once logged in as a Regular User, use the "List Your Estate" option in the sidebar to submit your estate for admin review.',
  },
  {
    q: 'How do I apply to rent a house?',
    a: 'On the Explore page, find an estate with vacant houses and click "Apply to Rent". Fill in your details and submit — the estate admin will review your application.',
  },
  {
    q: 'What is a role badge?',
    a: 'Your role badge shows your current status on Communest: Regular User, Tenant, Estate Admin, or Communest Admin. It updates automatically when your status changes.',
  },
  {
    q: 'How do I contact support?',
    a: 'For account issues, please email us at support@communest.gmail.com. Our team responds within 24 hours.',
  },
  {
    q: 'Is my information safe?',
    a: 'Yes. Communest handles all user data with care and follows strict privacy standards. Read our Privacy Policy for full details.',
  },
];

const QUICK_LINKS = [
  { label: 'Explore Estates', to: '/explore' },
  { label: 'Sign In / Register', to: '/sign-in' },
  { label: 'About Communest', to: '/about' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
];

const SOCIAL_LINKS = [
  { label: 'Twitter / X', href: 'https://twitter.com/communest' },
  { label: 'Facebook', href: 'https://facebook.com/communest' },
  { label: 'Instagram', href: 'https://instagram.com/communest' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/communest' },
];

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const faq of FAQS) {
    const keywords = faq.q.toLowerCase().split(' ').filter((w) => w.length > 3);
    if (keywords.some((kw) => lower.includes(kw))) {
      return faq.a;
    }
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! I'm the Communest assistant. I can help you navigate the platform, answer FAQs, or direct you to the right page. What can I help you with?";
  }
  if (lower.includes('explore') || lower.includes('estate') || lower.includes('house')) {
    return 'Head to the Explore page to browse all available estates and vacant houses. You can filter by county and price range!';
  }
  return "I'm not sure I understood that. Try asking about finding a house, listing an estate, or your account. You can also use the quick links below to navigate.";
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'chat' | 'faq'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', from: 'bot', text: "Hi! I'm Communest Assistant. How can I help you today?" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"
        style={{ background: 'var(--primary)', color: '#fff', border: '2px solid var(--accent)' }}
        aria-label="Open assistant"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 md:w-96 rounded-2xl shadow-2xl flex flex-col animate-fade-in"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', maxHeight: '520px' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-t-2xl"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="font-semibold text-sm">Communest Assistant</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTab('chat')}
                className="text-xs px-2 py-0.5 rounded transition-all"
                style={{ background: tab === 'chat' ? 'rgba(255,255,255,0.25)' : 'transparent' }}
              >
                Chat
              </button>
              <button
                onClick={() => setTab('faq')}
                className="text-xs px-2 py-0.5 rounded transition-all"
                style={{ background: tab === 'faq' ? 'rgba(255,255,255,0.25)' : 'transparent' }}
              >
                FAQ
              </button>
            </div>
          </div>

          {/* Content */}
          {tab === 'chat' ? (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2" style={{ maxHeight: '300px' }}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[80%] text-sm px-3 py-2 rounded-xl leading-relaxed"
                      style={
                        msg.from === 'user'
                          ? { background: 'var(--primary)', color: '#fff' }
                          : { background: 'var(--secondary)', color: 'var(--foreground)' }
                      }
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick links */}
              <div className="px-4 py-2" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Quick navigation</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_LINKS.map((link) => (
                    <button
                      key={link.to}
                      onClick={() => { navigate(link.to); setOpen(false); }}
                      className="text-xs px-2 py-1 rounded-full transition-all hover:opacity-80"
                      style={{ background: 'var(--secondary)', color: 'var(--accent)', border: '1px solid var(--border)' }}
                    >
                      {link.label}
                    </button>
                  ))}
                  {SOCIAL_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2 py-1 rounded-full transition-all hover:opacity-80"
                      style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

            </>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3" style={{ maxHeight: '420px' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Frequently Asked Questions</p>
              {FAQS.map((faq, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--accent)' }}>{faq.q}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{faq.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
