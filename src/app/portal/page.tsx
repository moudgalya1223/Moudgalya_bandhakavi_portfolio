'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, signOut } from '@/lib/auth';
import { subscribeToProjects, subscribeToInvoices, subscribeToLeads, addLead, Project, Invoice, Lead } from '@/lib/firestore';
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
  Code2,
  Layers
} from 'lucide-react';
import Link from 'next/link';

export default function ClientPortal() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clientLeads, setClientLeads] = useState<Lead[]>([]);

  // State for Proposal Modal (Declared at top of component for Rules of Hooks)
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalStack, setProposalStack] = useState('Full-Stack Web App');
  const [proposalBudget, setProposalBudget] = useState('Project-based USD ($)');
  const [proposalTimeline, setProposalTimeline] = useState('2-4 Weeks');
  const [proposalDesc, setProposalDesc] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState(false);

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
    const unsubLeads = subscribeToLeads(setClientLeads);

    return () => {
      unsubAuth();
      unsubProjects();
      unsubInvoices();
      unsubLeads();
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

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProposal(true);
    try {
      // 1. Add lead entry to client store
      await addLead({
        name: user?.displayName || user?.email || 'Client Partner',
        email: user?.email || 'client@company.com',
        projectType: proposalStack,
        budget: proposalBudget,
        goals: `[CLIENT PORTAL PROPOSAL] ${proposalTitle}: ${proposalDesc}`,
        stage: 'proposal',
        meetingDate: `Target timeline: ${proposalTimeline}`,
      });

      // 2. Dispatch to backend API
      await fetch('/api/proposal/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: user?.displayName || user?.email,
          clientEmail: user?.email,
          title: proposalTitle,
          description: proposalDesc,
          stack: proposalStack,
          budget: proposalBudget,
          timeline: proposalTimeline,
        }),
      });

      setProposalSuccess(true);
    } catch (err) {
      console.error('Error submitting proposal:', err);
    } finally {
      setSubmittingProposal(false);
    }
  };

  const getProposalMailto = () => {
    const subject = encodeURIComponent(`[NEW CLIENT PROPOSAL] ${proposalTitle} from ${user?.email}`);
    const body = encodeURIComponent(
      `New Project Proposal Submission!\n\n` +
      `Client Name: ${user?.displayName || 'Client Portal User'}\n` +
      `Client Email: ${user?.email}\n` +
      `Project Title: ${proposalTitle}\n` +
      `Preferred Stack: ${proposalStack}\n` +
      `Estimated Budget: ${proposalBudget}\n` +
      `Target Timeline: ${proposalTimeline}\n\n` +
      `Project Requirements:\n${proposalDesc}\n`
    );
    return `mailto:dattu99rockstar@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: '60px' }}>
      {/* Top Client Navbar */}
      <header style={{ height: '70px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 30px', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
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
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => { setProposalSuccess(false); setShowProposalModal(true); }}
                className="btn btn-cyan" 
                style={{ display: 'flex', gap: '8px' }}
              >
                <Code2 size={16} />
                <span>Submit New Proposal</span>
              </button>

              <a href="/#booking" className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
                <Calendar size={16} />
                <span>Book Follow-up Call</span>
              </a>
            </div>
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

        {/* Project Requests & Proposal Status Section (Read-only for clients) */}
        <div className="glass-card" style={{ marginBottom: '30px', padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} className="text-cyan" />
                <span>Your Project Requests & Proposal Status</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                Track real-time progress and review status for all your submitted project requests and proposals.
              </p>
            </div>
            <button 
              onClick={() => { setProposalSuccess(false); setShowProposalModal(true); }}
              className="btn btn-cyan" 
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', gap: '6px' }}
            >
              <Code2 size={14} />
              <span>Submit New Request</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {clientLeads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No project requests submitted yet.</p>
              </div>
            ) : (
              clientLeads.map((lead) => {
                const getStatusInfo = (stage?: string) => {
                  switch (stage) {
                    case 'active':
                      return { label: 'ACTIVE / APPROVED', color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.1)' };
                    case 'proposal':
                      return { label: 'PROPOSAL UNDER REVIEW', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
                    case 'call':
                      return { label: 'CALL SCHEDULED', color: 'var(--accent-purple)', bg: 'rgba(124, 58, 237, 0.1)' };
                    default:
                      return { label: 'INQUIRY RECEIVED', color: 'var(--accent-cyan)', bg: 'rgba(6, 182, 212, 0.1)' };
                  }
                };
                const status = getStatusInfo(lead.stage);

                return (
                  <div key={lead.id} style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {lead.projectType || 'Project Proposal'}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Requested by: <strong>{lead.name}</strong> ({lead.email}) • Budget: <strong>{lead.budget}</strong>
                        </p>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: status.color, background: status.bg, padding: '4px 12px', borderRadius: '99px', border: `1px solid ${status.color}40`, textTransform: 'uppercase' }}>
                        {status.label}
                      </span>
                    </div>

                    {lead.goals && (
                      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {lead.goals}
                      </div>
                    )}

                    {lead.meetingDate && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} />
                        <span>Schedule Note: {lead.meetingDate}</span>
                      </div>
                    )}

                    {lead.notes && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                        Developer Response / Note: <em style={{ color: 'var(--text-primary)' }}>{lead.notes}</em>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Client Proposal Submission Modal */}
      {showProposalModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '560px', padding: '30px' }}>
            <button className="modal-close" onClick={() => setShowProposalModal(false)}>
              ✕
            </button>

            {!proposalSuccess ? (
              <>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
                  Submit Project Proposal
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Submit your request directly to lead developer <strong>dattamoudgalyabandhakavi@gmail.com</strong>.
                </p>

                <form onSubmit={handleProposalSubmit}>
                  <div className="form-group">
                    <label className="form-label">Project Title / Scope</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Next.js SaaS Web App or Critical API Bug Fix"
                      value={proposalTitle}
                      onChange={(e) => setProposalTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Service / Stack</label>
                      <select
                        className="form-select"
                        value={proposalStack}
                        onChange={(e) => setProposalStack(e.target.value)}
                      >
                        <option value="Full-Stack Web App">Full-Stack Web App</option>
                        <option value="Mobile App (React Native/Flutter)">Mobile App</option>
                        <option value="Bug Fix & Troubleshooting ($50/hr)">Bug Fix & Troubleshooting ($50/hr)</option>
                        <option value="Architecture & Code Audit">Architecture & Code Audit</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Budget (USD $)</label>
                      <select
                        className="form-select"
                        value={proposalBudget}
                        onChange={(e) => setProposalBudget(e.target.value)}
                      >
                        <option value="Small Bug Fix ($50/hr)">Small Bug Fix ($50/hr)</option>
                        <option value="Project-based <$1k USD">Project-based &lt;$1k USD</option>
                        <option value="Project-based $1k–$3k USD">Project-based $1k–$3k USD</option>
                        <option value="Project-based $3k+ USD">Project-based $3k+ USD</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Timeline</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ASAP / 2 Weeks / 1 Month"
                      value={proposalTimeline}
                      onChange={(e) => setProposalTimeline(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Project Requirements & Description</label>
                    <textarea
                      required
                      rows={4}
                      className="form-textarea"
                      placeholder="Describe the features, issues to fix, or deliverables required..."
                      value={proposalDesc}
                      onChange={(e) => setProposalDesc(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingProposal}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    {submittingProposal ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Submitting Proposal...</span>
                      </>
                    ) : (
                      'Submit Proposal'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', border: '2px solid var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyItems: 'center', margin: '0 auto 20px', color: 'var(--accent-emerald)' }}>
                  <CheckCircle2 size={30} style={{ margin: 'auto' }} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>
                  Proposal Submitted!
                </h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px', fontSize: '0.9rem' }}>
                  Thank you! Your proposal <strong>&quot;{proposalTitle}&quot;</strong> has been logged into your dashboard and dispatched to <strong>dattamoudgalyabandhakavi@gmail.com</strong>.
                </p>

                <button className="btn btn-secondary" onClick={() => setShowProposalModal(false)} style={{ width: '100%' }}>
                  Close & View Request Status
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
