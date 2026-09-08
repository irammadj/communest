import { useState } from 'react';
import Layout from '../components/Layout';
import { useUser, useAppData } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import type { Estate } from '../types';


function EstateBadge({ status }: { status: Estate['status'] }) {
  const map = {
    pending: { cls: 'badge badge-yellow', label: 'Pending' },
    approved: { cls: 'badge badge-green', label: 'Approved & Verified' },
    denied: { cls: 'badge badge-red', label: 'Denied' },
  };
  const b = map[status];
  return <span className={b.cls}>{b.label}</span>;
}

export default function Admin() {
  const { user } = useUser();
  const { estates, setEstates } = useAppData();
  const navigate = useNavigate();

  const [addAdminEmail, setAddAdminEmail] = useState('');
  const [addAdminMsg, setAddAdminMsg] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'deny' | null>(null);

  if (!user || user.role !== 'communest_admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] text-center px-6">
          <div>
            <p className="text-base font-medium mb-2" style={{ color: 'var(--foreground)' }}>Access Restricted</p>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>This page is only accessible to the Communest Admin.</p>
            <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAdminEmail) return;
    setAddAdminMsg(`Communest Admin access granted to ${addAdminEmail}.`);
    setAddAdminEmail('');
    setTimeout(() => setAddAdminMsg(''), 4000);
  };

  const requestAction = (id: string, action: 'approve' | 'deny') => {
    setConfirmId(id);
    setConfirmAction(action);
  };

  const confirmDecision = () => {
    if (!confirmId || !confirmAction) return;
    setEstates((prev) =>
      prev.map((e) =>
        e.id === confirmId
          ? { ...e, status: confirmAction === 'approve' ? 'approved' : 'denied' }
          : e
      )
    );
    setConfirmId(null);
    setConfirmAction(null);
  };

  const pending = estates.filter((e) => e.status === 'pending');
  const approved = estates.filter((e) => e.status === 'approved');
  const denied = estates.filter((e) => e.status === 'denied');

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-section" style={{ minHeight: '45vh', backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop&auto=format")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
          <span className="badge badge-blue mb-4">Admin Dashboard</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: '#fff' }}>
            Communest Administration
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(226,232,240,0.85)' }}>
            Manage estate approvals, platform admins, and overall platform health from this central dashboard.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10">

        {/* Add Admin */}
        <section>
          <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--foreground)' }}>Add Communest Admin</h2>
          <form onSubmit={handleAddAdmin} className="card flex flex-col gap-4 max-w-lg">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Enter the email address of a Regular User account to grant them full Communest Admin status. This cannot be used on Estate Admin or Tenant accounts.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                className="input-field flex-1"
                placeholder="regular.user@gmail.com"
                value={addAdminEmail}
                onChange={(e) => setAddAdminEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary whitespace-nowrap">Add Admin</button>
            </div>
            {addAdminMsg && <p className="text-sm" style={{ color: 'var(--success)' }}>{addAdminMsg}</p>}
          </form>
        </section>

        {/* Estates */}
        <section>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Estates</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
            Review submitted estates and approve or deny them. Estate owners are notified by email upon decision.
          </p>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Pending Review', count: pending.length, cls: 'badge-yellow' },
              { label: 'Approved', count: approved.length, cls: 'badge-green' },
              { label: 'Denied', count: denied.length, cls: 'badge-red' },
            ].map((s) => (
              <div key={s.label} className="card p-4 text-center">
                <p className="text-2xl font-bold mb-1" style={{ color: 'var(--accent)' }}>{s.count}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* All estates */}
          {estates.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No estates submitted yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {estates.map((estate) => (
                <div key={estate.id} className="card p-0 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <img
                      src={estate.estatePhoto}
                      alt={estate.name}
                      className="w-full md:w-44 h-32 md:h-auto object-cover flex-shrink-0"
                      style={{ background: 'var(--muted)' }}
                    />
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>{estate.name}</h3>
                            <EstateBadge status={estate.status} />
                          </div>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            {estate.location}, {estate.county} · {estate.units} units · {estate.totalArea.toLocaleString()} m²
                          </p>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          Submitted: {new Date(estate.submittedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs mb-4">
                        <span style={{ color: 'var(--muted-foreground)' }}>Mgmt: <span style={{ color: 'var(--foreground)' }}>{estate.managementName}</span></span>
                        <span style={{ color: 'var(--muted-foreground)' }}>Email: <span style={{ color: 'var(--foreground)' }}>{estate.managementEmail}</span></span>
                        <span style={{ color: 'var(--muted-foreground)' }}>Phone: <span style={{ color: 'var(--foreground)' }}>{estate.managementPhone}</span></span>
                        <span style={{ color: 'var(--muted-foreground)' }}>Title Deed: <span style={{ color: 'var(--foreground)' }}>{estate.titleDeedNumber}</span></span>
                      </div>

                      {estate.status === 'pending' && (
                        <div className="flex gap-3 mt-auto">
                          <button
                            onClick={() => requestAction(estate.id, 'approve')}
                            className="btn-primary text-sm py-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => requestAction(estate.id, 'deny')}
                            className="btn-ghost text-sm py-2 px-4 rounded-lg"
                            style={{ color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.4)' }}
                          >
                            Deny
                          </button>
                        </div>
                      )}

                      {estate.status !== 'pending' && (
                        <p className="text-xs mt-auto" style={{ color: 'var(--muted-foreground)' }}>
                          {estate.status === 'approved'
                            ? 'Estate owner notified — they have been prompted to register houses.'
                            : 'Estate owner notified — they may resubmit in 1 week.'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Confirmation modal */}
      {confirmId && confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-7 animate-fade-in" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="text-base font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Confirm {confirmAction === 'approve' ? 'Approval' : 'Denial'}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              {confirmAction === 'approve'
                ? 'This estate will be listed on the Explore page as Approved & Verified. The estate owner will receive an email notification.'
                : 'This estate will be marked as Denied. The estate owner will be notified and may resubmit in 1 week.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDecision}
                className="btn-primary flex-1 justify-center"
                style={confirmAction === 'deny' ? { background: 'var(--danger)' } : {}}
              >
                {confirmAction === 'approve' ? 'Approve Estate' : 'Deny Estate'}
              </button>
              <button onClick={() => { setConfirmId(null); setConfirmAction(null); }} className="btn-ghost px-5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
