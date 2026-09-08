import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="hero-section" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&h=900&fit=crop&auto=format")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5" style={{ color: '#fff', lineHeight: 1.1 }}>
            About Communest
          </h1>
          <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(226,232,240,0.85)' }}>
            We are redefining how Kenyans find, rent, and manage residential housing — through a transparent, accessible, and trusted platform.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge badge-blue mb-4">Our Mission</span>
            <h2 className="section-heading mb-4">Making Good Housing Accessible for Every Kenyan</h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Communest was built with a single belief: that every Kenyan deserves access to quality, affordable housing — and that finding it should never feel like searching in the dark.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              We bridge the gap between property owners and prospective tenants, creating a verified, managed ecosystem where both parties can engage with confidence.
            </p>
          </div>
          <div className="card">
            <div className="mb-4" style={{ color: 'var(--accent)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Transparency First</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Every estate on Communest is reviewed and verified by our admin team before it is listed publicly. You see only what has earned a stamp of approval.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="section-heading mb-3">What We Stand For</h2>
            <p className="section-subheading max-w-xl mx-auto">
              Our platform is built on principles that put people first.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
                title: 'Trust & Safety',
                desc: 'All estates are verified. All users are accountable. We maintain a safe environment for every interaction on the platform.',
              },
              {
                icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
                title: 'Nationwide Coverage',
                desc: 'From Nairobi to Mombasa, Kisumu to Eldoret — Communest connects housing seekers across all 47 counties of Kenya.',
              },
              {
                icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
                title: 'Efficiency',
                desc: 'We eliminate the friction in traditional house hunting and estate management — saving time, reducing miscommunication, and cutting out the middleman.',
              },
              {
                icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
                title: 'Community',
                desc: 'Communest is not just a listing platform — it is a community of owners, managers, and residents working toward better living standards.',
              },
              {
                icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
                title: 'Affordability',
                desc: 'We believe financial transparency leads to fairer pricing. Every listing shows clear rent details and available payment options.',
              },
              {
                icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
                title: 'Kenyan-Built',
                desc: 'Communest was designed specifically for the Kenyan housing market — respecting local realities, regulations, and the way Kenyans live and move.',
              },
            ].map((item) => (
              <div key={item.title} className="card">
                <div className="mb-4" style={{ color: 'var(--accent)' }}>{item.icon}</div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="section-heading mb-6">Why Communest?</h2>
            <div className="flex flex-col gap-5">
              {[
                { q: 'For Tenants', a: "Browse verified estates, filter by location and budget, apply to rent with a single form, and manage your tenancy — payments, maintenance, and inquiries — all in one place." },
                { q: 'For Estate Owners', a: "List your estate, get it approved by Communest, register your houses, and manage tenants digitally. No more chasing calls or paper receipts." },
                { q: 'For Peace of Mind', a: "Every party on the platform is a registered, verified account. Our admin-reviewed approval process means only legitimate estates reach tenants." },
              ].map((item) => (
                <div key={item.q} className="flex gap-4">
                  <div className="w-1 rounded-full flex-shrink-0 mt-1" style={{ background: 'var(--accent)', minHeight: '2rem' }} />
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{item.q}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&auto=format"
              alt="Modern residential estate in Kenya"
              className="w-full h-full object-cover"
              style={{ minHeight: '300px' }}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
