import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useUser, useAppData } from '../context/UserContext';


const COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kiambu', 'Thika',
  'Machakos', 'Meru', 'Nyeri', 'Kakamega', 'Kisii', 'Kericho', 'Lamu',
  'Malindi', 'Garissa', 'Isiolo', 'Embu', "Murang'a", 'Other',
];

export default function ListYourEstate() {
  const { user } = useUser();
  const { setEstates } = useAppData();
  const navigate = useNavigate();

  const [submitted, setSubmitted] = useState(false);

  // Estate details
  const [estateName, setEstateName] = useState('');
  const [location, setLocation] = useState('');
  const [county, setCounty] = useState(COUNTIES[0]);
  const [units, setUnits] = useState('');
  const [totalArea, setTotalArea] = useState('');
  const [description, setDescription] = useState('');

  // Management
  const [mgmtName, setMgmtName] = useState('');
  const [mgmtEmail, setMgmtEmail] = useState('');
  const [mgmtPhone, setMgmtPhone] = useState('');

  // Legal
  const [titleDeed, setTitleDeed] = useState('');

  // Media
  const [estatePhoto, setEstatePhoto] = useState<File | null>(null);
  const [estatePhotoPreview, setEstatePhotoPreview] = useState<string | null>(null);
  const [amenityPhotos, setAmenityPhotos] = useState<File[]>([]);

  // Consent
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const emailValid = (e: string) => e.endsWith('@gmail.com') || e.endsWith('@email.com');
  const phoneValid = (p: string) => p.startsWith('+254') && p.replace('+254', '').replace(/\D/g, '').length >= 9;

  const isFormValid =
    estateName.length >= 4 && estateName.length <= 20 &&
    location.length >= 4 && location.length <= 20 &&
    county.length >= 4 && county.length <= 10 &&
    Number(units) >= 1 && Number(units) <= 1000 &&
    totalArea.length >= 1 && totalArea.length <= 6 &&
    mgmtName.length >= 4 && mgmtName.length <= 20 &&
    emailValid(mgmtEmail) &&
    phoneValid(mgmtPhone) &&
    titleDeed.length > 0 &&
    estatePhoto !== null &&
    agreed;

  const handleEstatePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEstatePhoto(file);
      setEstatePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAmenityPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAmenityPhotos(files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isFormValid) { setError('Please fill in all required fields correctly.'); return; }
    const newEstate = {
      id: `estate-${Date.now()}`,
      name: estateName,
      location,
      county,
      units: Number(units),
      totalArea: Number(totalArea),
      description,
      managementName: mgmtName,
      managementEmail: mgmtEmail,
      managementPhone: mgmtPhone,
      titleDeedNumber: titleDeed,
      estatePhoto: estatePhotoPreview ?? '',
      amenityPhotos: [],
      status: 'pending' as const,
      adminId: user?.id ?? '',
      submittedAt: new Date().toISOString(),
    };
    setEstates((prev) => [...prev, newEstate]);
    setSubmitted(true);
  };

  if (!user || (user.role !== 'regular_user' && user.role !== 'estate_admin')) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] text-center px-6">
          <div>
            <p className="mb-2 text-base font-medium" style={{ color: 'var(--foreground)' }}>Access Restricted</p>
            <p className="mb-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              This page is only available to Regular Users and Estate Admins.
            </p>
            <button onClick={() => navigate('/sign-in')} className="btn-primary">Sign In</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-section" style={{ minHeight: '50vh', backgroundImage: 'url("https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1600&h=900&fit=crop&auto=format")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: '#fff' }}>List Your Estate</h1>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(226,232,240,0.85)' }}>
            Submit your estate for Communest Admin review. Once approved, you can register houses and start managing tenants.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {submitted ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Submitted for Approval!</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Your estate has been submitted to the Communest Admin for review. You will be notified by email once a decision is made.
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">Back to Home</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Estate Details */}
            <section>
              <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--foreground)' }}>Estate Details</h2>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Estate Name *</label>
                    <input className="input-field" type="text" placeholder="4–20 characters" minLength={4} maxLength={20} value={estateName} onChange={(e) => setEstateName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Location *</label>
                    <input className="input-field" type="text" placeholder="4–20 characters" minLength={4} maxLength={20} value={location} onChange={(e) => setLocation(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>County *</label>
                    <select className="input-field" value={county} onChange={(e) => setCounty(e.target.value)} required>
                      {COUNTIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Number of Units *</label>
                    <input className="input-field" type="number" placeholder="1–1000" min={1} max={1000} value={units} onChange={(e) => setUnits(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Total Area (m²) *</label>
                    <input className="input-field" type="number" placeholder="e.g. 12500" min={1} value={totalArea} onChange={(e) => setTotalArea(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Description <span style={{ color: 'var(--muted-foreground)' }}>(optional)</span></label>
                  <textarea className="input-field resize-none" rows={3} placeholder="Brief description of the estate..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
            </section>

            <hr className="divider" />

            {/* Management Details */}
            <section>
              <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--foreground)' }}>Management Details</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Management Name *</label>
                  <input className="input-field" type="text" placeholder="4–20 characters" minLength={4} maxLength={20} value={mgmtName} onChange={(e) => setMgmtName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Management Email *</label>
                    <input className="input-field" type="email" placeholder="office@gmail.com" value={mgmtEmail} onChange={(e) => setMgmtEmail(e.target.value)} required />
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Must end with @gmail.com or @email.com</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Management Phone *</label>
                    <input className="input-field" type="tel" placeholder="+254712345678" value={mgmtPhone} onChange={(e) => setMgmtPhone(e.target.value)} required />
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Must start with +254</p>
                  </div>
                </div>
              </div>
            </section>

            <hr className="divider" />

            {/* Legal */}
            <section>
              <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--foreground)' }}>Legal Documentation</h2>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Title Deed Number *</label>
                <input className="input-field" type="text" placeholder="e.g. TD-NBI-2020-00123" value={titleDeed} onChange={(e) => setTitleDeed(e.target.value)} required />
              </div>
            </section>

            <hr className="divider" />

            {/* Media */}
            <section>
              <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--foreground)' }}>Media</h2>
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Estate Photo * <span style={{ color: 'var(--muted-foreground)' }}>(exactly 1 photo)</span></label>
                  <label
                    className="flex flex-col items-center justify-center w-full h-36 rounded-xl cursor-pointer transition-all"
                    style={{ border: '2px dashed var(--border)', background: 'var(--secondary)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                  >
                    {estatePhotoPreview ? (
                      <img src={estatePhotoPreview} alt="Estate" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="flex flex-col items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        <span className="text-sm">Click to upload estate photo</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleEstatePhoto} required />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                    Amenities Photos <span style={{ color: 'var(--muted-foreground)' }}>(optional, multiple allowed)</span>
                  </label>
                  <label
                    className="flex flex-col items-center justify-center w-full h-24 rounded-xl cursor-pointer transition-all"
                    style={{ border: '2px dashed var(--border)', background: 'var(--secondary)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                  >
                    <div className="flex flex-col items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                      <span className="text-sm">{amenityPhotos.length > 0 ? `${amenityPhotos.length} photo(s) selected` : 'Upload amenity photos'}</span>
                    </div>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleAmenityPhotos} />
                  </label>
                </div>
              </div>
            </section>

            <hr className="divider" />

            {/* Consent */}
            <section>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-blue-500" />
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  I agree to the{' '}
                  <Link to="/terms-and-conditions" className="underline" style={{ color: 'var(--accent)' }} target="_blank">Terms and Conditions</Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="underline" style={{ color: 'var(--accent)' }} target="_blank">Privacy Policy</Link>.
                  I confirm that all information provided is accurate.
                </span>
              </label>
            </section>

            {error && <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>}

            <button
              type="submit"
              className="btn-primary w-full justify-center py-3.5 text-base"
              disabled={!isFormValid}
              style={{ opacity: isFormValid ? 1 : 0.5, cursor: isFormValid ? 'pointer' : 'not-allowed' }}
            >
              Submit for Approval
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
