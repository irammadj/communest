import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useUser } from '../context/UserContext';
import type { UserRole } from '../types';

type Tab = 'signin' | 'register';

const ROLE_REDIRECT: Record<UserRole, string> = {
  communest_admin: '/admin',
  estate_admin: '/my-estate',
  tenant: '/my-estate',
  regular_user: '/explore',
  outsider: '/explore',
};

function validatePassword(pw: string) {
  return {
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    symbol: /[^a-zA-Z0-9]/.test(pw),
    number: /[0-9]/.test(pw),
    length: pw.length >= 12,
  };
}

export default function SignIn() {
  const { login, loginWithCredentials, registerUser } = useUser();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('signin');

  // Sign-in state
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siShowPw, setSiShowPw] = useState(false);
  const [siError, setSiError] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShowPw, setRegShowPw] = useState(false);
  const [regTerms, setRegTerms] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Demo login
  const [demoRole, setDemoRole] = useState<UserRole>('regular_user');

  const pwChecks = validatePassword(regPassword);
  const pwValid = Object.values(pwChecks).every(Boolean);

  const emailValid = (e: string) => e.endsWith('@gmail.com') || e.endsWith('@email.com');
  const phoneValid = (p: string) => p.startsWith('+254') && p.replace('+254', '').replace(/\D/g, '').length >= 9;

  const handleDemoLogin = () => {
    login(demoRole);
    navigate(ROLE_REDIRECT[demoRole]);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSiError('');
    if (!emailValid(siEmail)) { setSiError('Email must end with @gmail.com or @email.com'); return; }
    if (!siPassword) { setSiError('Please enter your password'); return; }
    try {
      await loginWithCredentials(siEmail, siPassword);
      navigate('/explore');
    } catch (err: any) {
      setSiError(err.message ?? 'Sign in failed. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (regName.length < 4 || regName.length > 20) { setRegError('Full name must be 4–20 characters'); return; }
    if (!emailValid(regEmail)) { setRegError('Email must end with @gmail.com or @email.com'); return; }
    if (!phoneValid(regPhone)) { setRegError('Phone must start with +254 and have at least 9 digits after prefix'); return; }
    if (!pwValid) { setRegError('Password does not meet all requirements'); return; }
    if (!regTerms) { setRegError('You must agree to the Terms and Conditions and Privacy Policy'); return; }
    try {
      await registerUser(regName, regEmail, regPhone, regPassword);
      setRegSuccess(true);
    } catch (err: any) {
      setRegError(err.message ?? 'Registration failed. Please try again.');
    }
  };

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  return (
    <Layout hideFooter>
      <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--background)' }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>
              {tab === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {tab === 'signin' ? 'Sign in to your Communest account' : "Join Communest — Kenya's housing platform"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: 'var(--secondary)' }}>
            {(['signin', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
                style={tab === t ? { background: 'var(--primary)', color: '#fff' } : { color: 'var(--muted-foreground)' }}
              >
                {t === 'signin' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Demo role picker */}
          <div className="card mb-6 p-4">
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
              Demo — select a role to preview
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {(['communest_admin', 'estate_admin', 'tenant', 'regular_user'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setDemoRole(r)}
                  className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                  style={demoRole === r ? { background: 'var(--primary)', color: '#fff' } : { background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                >
                  {r.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </button>
              ))}
            </div>
            <button onClick={handleDemoLogin} className="btn-outline w-full py-2 text-sm justify-center">
              Continue as {demoRole.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>or continue with form</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* Sign In Form */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@gmail.com"
                  value={siEmail}
                  onChange={(e) => setSiEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Password</label>
                <div className="relative">
                  <input
                    type={siShowPw ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Your password"
                    value={siPassword}
                    onChange={(e) => setSiPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setSiShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <EyeIcon open={siShowPw} />
                  </button>
                </div>
              </div>
              {siError && <p className="text-xs" style={{ color: 'var(--danger)' }}>{siError}</p>}
              <button type="submit" className="btn-primary w-full justify-center py-3 mt-1">Sign In</button>
              <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                Forgot your password?{' '}
                <a href="mailto:support@communest.gmail.com" className="underline" style={{ color: 'var(--accent)' }}>
                  Contact us
                </a>{' '}
                for account retrieval.
              </p>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && !regSuccess && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="4–20 characters"
                  value={regName}
                  minLength={4}
                  maxLength={20}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Must end with @gmail.com or @email.com</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Phone Number</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+254712345678"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                />
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Must start with +254, minimum 9 digits after prefix</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Password</label>
                <div className="relative">
                  <input
                    type={regShowPw ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Min. 12 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setRegShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <EyeIcon open={regShowPw} />
                  </button>
                </div>
                {regPassword && (
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {[
                      { key: 'upper', label: 'Uppercase letter' },
                      { key: 'lower', label: 'Lowercase letter' },
                      { key: 'symbol', label: 'Symbol' },
                      { key: 'number', label: 'Number' },
                      { key: 'length', label: 'Min. 12 characters' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-1.5 text-xs">
                        <span style={{ color: pwChecks[key as keyof typeof pwChecks] ? 'var(--success)' : 'var(--muted-foreground)' }}>
                          {pwChecks[key as keyof typeof pwChecks] ? '✓' : '○'}
                        </span>
                        <span style={{ color: pwChecks[key as keyof typeof pwChecks] ? 'var(--success)' : 'var(--muted-foreground)' }}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regTerms}
                  onChange={(e) => setRegTerms(e.target.checked)}
                  className="mt-0.5 accent-blue-500"
                />
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  I agree to the{' '}
                  <Link to="/terms-and-conditions" className="underline" style={{ color: 'var(--accent)' }} target="_blank">
                    Terms and Conditions
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="underline" style={{ color: 'var(--accent)' }} target="_blank">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {regError && <p className="text-xs" style={{ color: 'var(--danger)' }}>{regError}</p>}

              <button
                type="submit"
                className="btn-primary w-full justify-center py-3 mt-1"
                disabled={!regTerms || !pwValid}
                style={{ opacity: (!regTerms || !pwValid) ? 0.5 : 1, cursor: (!regTerms || !pwValid) ? 'not-allowed' : 'pointer' }}
              >
                Create Account
              </button>
            </form>
          )}

          {/* Register success */}
          {tab === 'register' && regSuccess && (
            <div className="text-center py-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>Account Created!</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Your account has been created successfully. You can now sign in.
              </p>
              <button
                onClick={() => { setTab('signin'); setRegSuccess(false); }}
                className="btn-primary"
              >
                Continue to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
