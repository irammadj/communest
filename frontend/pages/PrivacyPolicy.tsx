import Layout from '../components/Layout';

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <span className="badge badge-blue mb-4">Legal</span>
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>Privacy Policy</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Last updated: January 2025</p>
        </div>

        <div className="flex flex-col gap-8" style={{ color: 'var(--muted-foreground)' }}>
          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>1. Introduction</h2>
            <p className="text-sm leading-relaxed">
              Communest ("we", "our", or "us") is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. By accessing Communest, you agree to the terms of this policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>2. Information We Collect</h2>
            <p className="text-sm leading-relaxed mb-3">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="text-sm leading-relaxed flex flex-col gap-2 pl-4">
              {[
                'Full name, email address, and phone number upon registration.',
                'Profile picture, if you choose to upload one.',
                'Estate and property details, if you submit a listing.',
                'Rental application details, including contact information.',
                'Inquiries, maintenance reports, and payment records related to your tenancy.',
                'Communications between tenants and estate administrators on the platform.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>3. How We Use Your Information</h2>
            <p className="text-sm leading-relaxed mb-3">Your information is used solely to:</p>
            <ul className="text-sm leading-relaxed flex flex-col gap-2 pl-4">
              {[
                'Create and manage your Communest account.',
                'Facilitate estate listings, rental applications, and tenancy management.',
                'Send important notifications related to your account or estate activity.',
                'Verify your identity and maintain platform integrity.',
                'Improve our services and user experience.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>4. Data Protection &amp; Security</h2>
            <p className="text-sm leading-relaxed mb-3">
              We take the security of your personal information seriously. All user data is handled with care and protected using industry-standard security measures, including:
            </p>
            <ul className="text-sm leading-relaxed flex flex-col gap-2 pl-4">
              {[
                'Encrypted storage of passwords and sensitive credentials.',
                'Secure transmission of data using HTTPS protocols.',
                'Access controls that limit data access to authorised personnel only.',
                'Regular reviews of our data collection, storage, and processing practices.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>—</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>5. Sharing of Information</h2>
            <p className="text-sm leading-relaxed">
              Communest does not sell, trade, or rent your personal information to third parties. Your data may be shared within the platform between tenants and estate administrators strictly as required for the rental and management process (e.g., sharing your application details with the estate admin you applied to). We will not disclose your information to external parties except where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>6. Data Retention</h2>
            <p className="text-sm leading-relaxed">
              We retain your personal data for as long as your account is active or as necessary to provide our services. If you request account deletion, we will remove your personal information within 30 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>7. Your Rights</h2>
            <p className="text-sm leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="text-sm leading-relaxed flex flex-col gap-2 pl-4">
              {[
                'Access the personal data we hold about you.',
                'Request correction of inaccurate or incomplete data.',
                'Request deletion of your account and associated data.',
                'Object to the processing of your data in certain circumstances.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>—</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:privacy@communest.gmail.com" className="underline" style={{ color: 'var(--accent)' }}>privacy@communest.gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>8. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically to stay informed about how we protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>9. Contact Us</h2>
            <p className="text-sm leading-relaxed">
              If you have any questions or concerns about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@communest.gmail.com" className="underline" style={{ color: 'var(--accent)' }}>privacy@communest.gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
