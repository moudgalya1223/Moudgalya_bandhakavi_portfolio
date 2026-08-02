'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, signOut } from '@/lib/auth';
import { subscribeToProjects, subscribeToInvoices, Project, Invoice } from '@/lib/firestore';
import { 
  FolderGit2, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ExternalLink, 
  LogOut, 
  Calendar, 
  User, 
  Loader2,
  ShieldCheck,
  Code2
} from 'lucide-react';
import Link from 'next/link';

export default function ClientPortal() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const unsubAuth = onAuthChange((currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    const unsubProjects = subscribeToProjects(setProjects);
    const unsubInvoices = subscribeToInvoices(setInvoices);

    return () => {
      unsubAuth();
      unsubProjects();
      unsubInvoices();
    };
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin text-purple" size={40} />
      </div>
    );
  }

  // Active project for this client (defaults to primary active project)
  const activeProject = projects[0] || {
    id: 'demo-1',
    name: 'Full-Stack Web & AI Application',
    client: user?.displayName || user?.email || 'Client Partner',
    progress: 65,
    status: 'active',
    description: 'Custom Next.js & Python implementation with cloud database integration, REST APIs, and automated workflows.',
    startDate: '2026-07-01',
    contractUrl: 'https://github.com',
  };

  const clientInvoices = invoices.length > 0 ? invoices : [
    {
      id: 'inv-client-1',
      clientName: user?.displayName || 'Client Partner',
      clientEmail: user?.email || 'client@company.com',
      amount: 4500,
      currency: 'USD',
      description: 'Milestone 1 — Architecture & Core UI Development',
      status: 'paid' as const,
      dueDate: '2026-07-15',
      stripePaymentLink: 'https://checkout.stripe.com/pay/mock_link',
    },
    {
      id: 'inv-client-2',
      clientName: user?.displayName || 'Client Partner',
      clientEmail: user?.email || 'client@company.com',
      amount: 3500,
      currency: 'USD',
      description: 'Milestone 2 — Backend API Integration & Cloud Deployment',
      status: 'sent' as const,
      dueDate: '2026-08-15',
      stripePaymentLink: 'https://checkout.stripe.com/pay/mock_link',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: '60px' }}>
      {/* Top Client Navbar */}
      <header style={{ height: '70px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 30px', justifyContent: 'space-between', sticky: 'top', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          MOUDGALYA<span>.B</span> <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, marginLeft: '8px', padding: '2px 8px', background: 'rgba(6,182,212,0.1)', borderRadius: '4px', border: '1px solid rgba(6,182,212,0.2)' }}>CLIENT PORTAL</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <User size={16} className="text-purple" />
            <span>{user?.email || 'Client Portal'}</span>
          </div>
          <button className="btn btn-secondary" onClick={handleSignOut} style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', gap: '6px' }}>
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '40px' }}>
        {/* Welcome Header Card */}
        <div className="glass-card" style={{ marginBottom: '30px', padding: '30px', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Welcome to your Private Dashboard
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>
                {activeProject.name}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px' }}>
                Lead Developer: <strong>Moudgalya Bandhakavi</strong> (Senior Full-Stack & AI Engineer)
              </p>
            </div>
            
            <a href="/#booking" className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
              <Calendar size={16} />
              <span>Book Follow-up Call</span>
            </a>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '30px', marginBottom: '30px' }}>
          {/* Active Project Progress & Description */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderGit2 size={20} className="text-purple" />
                <span>Project Progress & Deliverables</span>
              </h2>
              <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', padding: '4px 10px', borderRadius: '99px', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                Status: {activeProject.status.toUpperCase()}
              </span>
            </div>

            {/* Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 600 }}>
                <span>Completion Status</span>
                <span style={{ color: 'var(--accent-cyan)' }}>{activeProject.progress}%</span>
              </div>
              <div style={{ height: '10px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${activeProject.progress}%`, background: 'linear-gradient(90deg, var(--accent-purple) 0%, var(--accent-cyan) 100%)', borderRadius: '99px' }} />
              </div>
            </div>

            {/* Description */}
            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Project Description</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {activeProject.description}
              </p>
            </div>

            {/* Milestones Checklist */}
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Key Milestones</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />
                  <span>Architecture Specification & Scope Alignment</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />
                  <span>Responsive UI Design & Component Setup</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <Clock size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span>Database & REST API Endpoints Integration (In Progress)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--border-color)' }} />
                  <span>Final Quality Assurance & Security Audit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Documents & Contract */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="glass-card">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} className="text-cyan" />
                <span>Agreement & Legal Documents</span>
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                Access signed Master Services Agreements (MSA), statement of work documents, and NDA contracts.
              </p>

              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Master Consulting Agreement</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Signed & Verified • PDF Format</div>
                </div>
                <a 
                  href={activeProject.contractUrl || 'https://github.com'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', gap: '4px' }}
                >
                  <span>View PDF</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Invoices & Stripe Payments */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} className="text-purple" />
                <span>Invoices & Direct Billing</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {clientInvoices.map((inv) => (
                  <div key={inv.id} style={{ padding: '14px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{inv.description}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Due Date: {inv.dueDate} • <strong>${inv.amount.toLocaleString()}</strong>
                      </div>
                    </div>
                    <div>
                      {inv.status === 'paid' ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '99px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          PAID
                        </span>
                      ) : (
                        <a 
                          href={inv.stripePaymentLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-cyan"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          Pay Invoice
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
