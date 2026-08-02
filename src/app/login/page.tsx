'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithGoogle, onAuthChange, isAdmin } from '@/lib/auth';
import { LogIn, Loader2, ArrowLeft, Shield } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (user && isAdmin(user)) {
        router.push('/admin');
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
      if (!isAdmin(cred.user)) {
        setErrorMsg('Access denied: You are not authorized to view the developer dashboard.');
      } else {
        router.push('/admin');
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div className="ambient-glow glow-purple" />
      <div className="ambient-glow glow-cyan" />

      <Link href="/" style={{ position: 'absolute', top: '40px', left: '40px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>
        <ArrowLeft size={16} />
        <span>Back to Portfolio</span>
      </Link>

      <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '40px', textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', border: '1.5px solid var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--accent-purple)' }}>
          <Shield size={30} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>
          Developer Access
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '32px' }}>
          Sign in to access your administrative dashboard, project milestones, and client lead pipeline.
        </p>

        {errorMsg && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', color: '#fca5a5', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.85rem', lineHeight: 1.4, textAlign: 'left' }}>
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', gap: '10px', height: '48px' }}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <LogIn size={18} />
          )}
          <span>Sign In with Google</span>
        </button>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '24px', lineHeight: 1.4 }}>
          Protected under developer console configuration. Unauthorized access queries are logged via security settings.
        </p>
      </div>
    </div>
  );
}
