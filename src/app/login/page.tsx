'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signInWithGoogle, onAuthChange, getUserRole } from '@/lib/auth';
import { LogIn, Loader2, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get('role'); // 'admin' or 'client'

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (user) {
        const role = getUserRole(user);
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/portal');
        }
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsub();
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const cred = await signInWithGoogle();
      const role = getUserRole(cred.user);
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/portal');
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin text-purple" size={40} />
      </div>
    );
  }

  const isAdminIntent = requestedRole === 'admin';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div className="ambient-glow glow-purple" />
      <div className="ambient-glow glow-cyan" />

      <Link href="/" style={{ position: 'absolute', top: '40px', left: '40px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>
        <ArrowLeft size={16} />
        <span>Back to Portfolio</span>
      </Link>

      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '40px', textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: isAdminIntent ? 'rgba(124, 58, 237, 0.1)' : 'rgba(6, 182, 212, 0.1)', border: `1.5px solid ${isAdminIntent ? 'var(--accent-purple)' : 'var(--accent-cyan)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: isAdminIntent ? 'var(--accent-purple)' : 'var(--accent-cyan)' }}>
          {isAdminIntent ? <ShieldCheck size={30} /> : <UserCheck size={30} />}
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>
          {isAdminIntent ? 'Admin Console Login' : 'Client Portal Sign In'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '32px' }}>
          {isAdminIntent 
            ? 'Sign in to access developer administrative functions, project progress bars, and billing ledgers.'
            : 'Sign in to view your active project deliverables, milestone progress, contract documents, and invoices.'
          }
        </p>

        {errorMsg && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', color: '#fca5a5', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.85rem', lineHeight: 1.4, textAlign: 'left' }}>
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`btn ${isAdminIntent ? 'btn-primary' : 'btn-cyan'}`}
          style={{ width: '100%', gap: '10px', height: '48px' }}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <LogIn size={18} />
          )}
          <span>Sign In with Google</span>
        </button>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.8rem' }}>
          {isAdminIntent ? (
            <Link href="/login" style={{ color: 'var(--accent-cyan)' }}>Switch to Client Portal Login</Link>
          ) : (
            <Link href="/login?role=admin" style={{ color: 'var(--accent-purple)' }}>Admin Portal Access</Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin text-purple" size={40} />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
