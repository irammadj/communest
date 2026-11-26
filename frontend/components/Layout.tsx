import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAppData } from '../context/UserContext';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export default function Layout({ children, hideFooter }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dataError, retryData, setDataError } = useAppData();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Navbar onMenuToggle={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 pt-16">
        {dataError && (
          <div
            role="alert"
            className="mx-auto mt-4 flex max-w-5xl items-start justify-between gap-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            <span>{dataError}</span>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={retryData}
                className="underline"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => setDataError(null)}
                className="underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
