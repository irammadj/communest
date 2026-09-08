import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useUser } from '../context/UserContext';

const HERO_IMAGE = 'https://static.vecteezy.com/system/resources/thumbnails/069/793/065/small/modern-homes-sunset-family-bikes-pathway-suburban-life-real-estate-marketing-free-photo.jpg';

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: 'Find Your Home',
    desc: 'Browse hundreds of vetted estates across Kenya. Filter by county, price, and more to find the perfect fit.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Estate Management',
    desc: 'Manage your estate end-to-end — from listing houses and notifying tenants to handling payments and maintenance.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    title: 'Verified Estates',
    desc: 'Every listed estate goes through Communest Admin review before appearing on the platform — giving you peace of mind.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: 'Simple Payments',
    desc: "Track rent and utility bills in one place. Estate managers set payment methods; tenants pay and see status updates instantly.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.95-.87a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    title: 'Direct Communication',
    desc: 'Tenants submit inquiries and estate admins reply directly — keeping all communication within the platform.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Secure & Trusted',
    desc: 'Your personal data is protected with care. We maintain strict privacy standards and transparent data practices.',
  },
];

const STATS = [
  { value: '500+', label: 'Estates Listed' },
  { value: '12,000+', label: 'Happy Tenants' },
  { value: '47', label: 'Counties Covered' },
  { value: '98%', label: 'Satisfaction Rate' },
];

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-section" style={{ minHeight: '92vh' }}>
        <div
          className="hero-bg"
          style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-28 text-center">
          <h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            style={{
              color: '#fff',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              textShadow: '0 2px 40px rgba(0,0,0,0.5)',
            }}
          >
            Find Your Perfect<br />
            <span
              style={{
                background: 'linear-gradient(90deg, #60a5fa 0%, #93c5fd 50%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Home in Kenya
            </span>
          </h1>
          <p
            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'rgba(226,232,240,0.8)', fontWeight: 400, letterSpacing: '-0.01em' }}
          >
            Communest connects Kenyans with quality housing and empowers estate managers with powerful tools — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/explore')} className="btn-primary text-base px-8 py-3.5">
              Explore Estates
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            {!isLoggedIn && (
              <button onClick={() => navigate('/sign-in')} className="btn-outline text-base px-8 py-3.5">
                Sign In
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: 'var(--border)', borderRadius: '1rem', overflow: 'hidden' }}>
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center px-8 py-8" style={{ background: 'var(--card)' }}>
                <div
                  className="text-4xl font-bold mb-1.5 tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <span className="section-accent-line mx-auto" />
          <h2 className="section-heading mb-3">How Communest Works</h2>
          <p className="section-subheading max-w-xl mx-auto">
            A simple, transparent process designed for both tenants and estate managers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {[
            { step: '01', title: 'Create an Account', desc: 'Register in minutes. Verify your email and phone to unlock full access.' },
            { step: '02', title: 'Explore or List', desc: "Browse available estates or submit your own estate for admin approval." },
            { step: '03', title: 'Move In or Manage', desc: 'Apply to rent a vacant house, or start managing tenants in your approved estate.' },
          ].map((item, i) => (
            <div key={i} className="card relative">
              <div className="text-5xl font-black mb-4" style={{ color: 'rgba(59,130,246,0.15)', lineHeight: 1 }}>
                {item.step}
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <span className="section-accent-line mx-auto" />
            <h2 className="section-heading mb-3">Everything You Need</h2>
            <p className="section-subheading max-w-xl mx-auto">
              From finding a home to managing an entire estate — Communest has the tools.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card group">
                <div className="mb-4" style={{ color: 'var(--accent)' }}>
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="section-heading mb-4">Ready to Find Your Next Home?</h2>
        <p className="section-subheading max-w-lg mx-auto mb-8">
          Join thousands of Kenyans who have found quality housing through Communest.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/explore')} className="btn-primary text-base px-8 py-3">
            Browse Estates
          </button>
          {!isLoggedIn && (
            <button onClick={() => navigate('/sign-in')} className="btn-outline text-base px-8 py-3">
              Create Account
            </button>
          )}
        </div>
      </section>
    </Layout>
  );
}
