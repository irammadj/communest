import Layout from '../components/Layout';

export default function TermsAndConditions() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <span className="badge badge-blue mb-4">Legal</span>
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>Terms and Conditions</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Last updated: January 2025</p>
        </div>

        <div className="flex flex-col gap-8" style={{ color: 'var(--muted-foreground)' }}>
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed">
              By accessing or using Communest ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Platform. Communest reserves the right to update these terms at any time, and continued use of the Platform constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>2. Use of the Platform</h2>
            <p className="text-sm leading-relaxed mb-3">
              You agree to use Communest only for lawful purposes and in a manner that does not infringe the rights of others. You must not:
            </p>
            <ul className="text-sm leading-relaxed flex flex-col gap-2 pl-4">
              {[
                'Submit false, misleading, or fraudulent estate listings or rental applications.',
                'Impersonate another user, estate admin, or Communest representative.',
                'Attempt to gain unauthorised access to any part of the Platform.',
                'Use the Platform to harass, threaten, or harm other users.',
                'Upload or share content that is illegal, defamatory, or violates third-party rights.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>3. Estate Listings and Approvals</h2>
            <p className="text-sm leading-relaxed">
              All estate submissions are subject to review and approval by the Communest Admin. Communest reserves the right to approve, deny, or remove any listing at its sole discretion. Approval of a listing does not constitute endorsement of the estate, its management, or its facilities. Users are encouraged to conduct their own due diligence before entering into any rental agreement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>4. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed">
              Communest provides the Platform as a facilitator between estate managers and prospective tenants. The website owner and Communest are not a party to any rental agreement formed through the Platform and shall not be held accountable for:
            </p>
            <ul className="text-sm leading-relaxed flex flex-col gap-2 pl-4 mt-3">
              {[
                'Disputes arising between tenants and estate administrators.',
                'The accuracy of information provided by estate owners or tenants.',
                'Financial loss, property damage, or personal harm resulting from interactions facilitated by the Platform.',
                'Any information leakage, data breach, or hacking incident that may occur despite reasonable security measures.',
                'Actions taken by third parties who gain unauthorised access to the Platform.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>—</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              Communest makes no warranties, express or implied, regarding the accuracy, reliability, or completeness of any content on the Platform. Use of the Platform is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>5. Intellectual Property</h2>
            <p className="text-sm leading-relaxed">
              All content, branding, design, and functionality of Communest are the intellectual property of Communest. You may not copy, reproduce, distribute, or create derivative works from any part of the Platform without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>6. Account Responsibility</h2>
            <p className="text-sm leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Communest shall not be liable for any loss or damage arising from your failure to safeguard your login information. If you suspect unauthorised access to your account, notify us immediately at{' '}
              <a href="mailto:support@communest.gmail.com" className="underline" style={{ color: 'var(--accent)' }}>support@communest.gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>7. Termination</h2>
            <p className="text-sm leading-relaxed">
              Communest reserves the right to suspend or terminate your account at any time, without notice, if you are found to be in violation of these Terms and Conditions or if your account poses a risk to the Platform or other users.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>8. Governing Law</h2>
            <p className="text-sm leading-relaxed">
              These Terms and Conditions are governed by and construed in accordance with the laws of Kenya. Any disputes arising from the use of the Platform shall be subject to the exclusive jurisdiction of the courts of Kenya.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>9. Contact</h2>
            <p className="text-sm leading-relaxed">
              For questions regarding these Terms and Conditions, contact us at{' '}
              <a href="mailto:legal@communest.gmail.com" className="underline" style={{ color: 'var(--accent)' }}>legal@communest.gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
