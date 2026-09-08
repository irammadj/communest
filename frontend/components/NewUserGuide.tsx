import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    title: 'Welcome to Communest!',
    description: 'Communest helps Kenyans find great housing and connects estate managers with tenants. Let us walk you through how the platform works.',
    action: null,
  },
  {
    title: 'Explore Available Estates',
    description: 'Visit the Explore page to browse approved estates across Kenya. Filter by county or price to find what suits you best.',
    action: { label: 'Go to Explore', to: '/explore' },
  },
  {
    title: 'Create an Account',
    description: 'Register for a free account to apply for rental housing, track your tenancy, or list your estate for management.',
    action: { label: 'Sign Up / Sign In', to: '/sign-in' },
  },
  {
    title: 'Apply to Rent',
    description: "Once you find a vacant house you like, click 'Apply to Rent' and submit your details. The estate admin will review your application.",
    action: null,
  },
  {
    title: 'List Your Estate',
    description: 'Are you an estate owner? After signing up, use the sidebar to submit your estate for Communest Admin review. Once approved, you can register houses and manage your tenants.',
    action: null,
  },
  {
    title: "You're all set!",
    description: "You know the basics of Communest. Explore estates, find your perfect home, or list yours today. We're glad you're here!",
    action: { label: 'Start Exploring', to: '/explore' },
  },
];

export default function NewUserGuide() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const seen = localStorage.getItem('communest_guide_seen');
    if (!seen) {
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('communest_guide_seen', '1');
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  };

  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleAction = (to: string) => {
    navigate(to);
    dismiss();
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="w-full max-w-md rounded-2xl p-8 animate-fade-in"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Progress dots */}
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? '2rem' : '0.5rem',
                background: i <= step ? 'var(--accent)' : 'var(--border)',
              }}
            />
          ))}
        </div>

        <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>{current.title}</h2>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--muted-foreground)' }}>{current.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={prev} className="btn-ghost text-sm px-4 py-2">
                Back
              </button>
            )}
            <button onClick={dismiss} className="btn-ghost text-sm px-4 py-2" style={{ color: 'var(--muted-foreground)' }}>
              Skip guide
            </button>
          </div>
          <div className="flex gap-2">
            {current.action && (
              <button
                onClick={() => handleAction(current.action!.to)}
                className="btn-outline text-sm py-2"
              >
                {current.action.label}
              </button>
            )}
            <button onClick={next} className="btn-primary text-sm py-2">
              {step === STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>

        <p className="text-xs mt-4 text-center" style={{ color: 'var(--muted-foreground)' }}>
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}
