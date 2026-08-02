'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, isAdmin } from '@/lib/auth';
import { Loader2, Plus, ShieldAlert } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import CommandPalette from '@/components/admin/CommandPalette';
import { addTask, addInvoice, addLead } from '@/lib/firestore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  // Quick Action Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // New task form fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskType, setTaskType] = useState<'bug' | 'feature' | 'refactor' | 'other'>('feature');
  
  // New invoice form fields
  const [invClientName, setInvClientName] = useState('');
  const [invClientEmail, setInvClientEmail] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invDesc, setInvDesc] = useState('');

  // New lead form fields
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadGoals, setLeadGoals] = useState('');

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (!user) {
        router.push('/login?role=admin');
      } else if (isAdmin(user)) {
        setAuthenticated(true);
        setLoading(false);
      } else {
        // Non-admin clients are redirected to the Client Portal
        router.push('/portal');
      }
    });
    return () => unsub();
  }, [router]);

  const handleQuickAction = (action: string) => {
    setActiveModal(action);
  };

  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    await addTask({
      title: taskTitle,
      status: 'todo',
      priority: taskPriority,
      type: taskType,
      order: Date.now(),
    });
    setTaskTitle('');
    setActiveModal(null);
  };

  const handleAddInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invClientName || !invAmount) return;
    await addInvoice({
      clientName: invClientName,
      clientEmail: invClientEmail,
      amount: parseFloat(invAmount),
      currency: 'USD',
      description: invDesc,
      status: 'sent',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      stripePaymentLink: 'https://checkout.stripe.com/pay/mock_link',
    });
    setInvClientName('');
    setInvClientEmail('');
    setInvAmount('');
    setInvDesc('');
    setActiveModal(null);
  };

  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail) return;
    await addLead({
      name: leadName,
      email: leadEmail,
      projectType: 'MVP',
      budget: '$1k–$3k',
      goals: leadGoals,
      stage: 'inquiry',
    });
    setLeadName('');
    setLeadEmail('');
    setLeadGoals('');
    setActiveModal(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin text-purple" size={40} />
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        {children}
      </main>

      <CommandPalette onQuickAction={handleQuickAction} />

      {/* Quick Action Modal: Add Task */}
      {activeModal === 'add-task' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>Create New Task</h2>
            <form onSubmit={handleAddTaskSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  value={taskTitle} 
                  onChange={(e) => setTaskTitle(e.target.value)} 
                  placeholder="e.g. Implement Google Calendar sync"
                />
              </div>
              <div className="grid-2" style={{ marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Priority</label>
                  <select 
                    className="form-select" 
                    value={taskPriority} 
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Type</label>
                  <select 
                    className="form-select" 
                    value={taskType} 
                    onChange={(e: any) => setTaskType(e.target.value)}
                  >
                    <option value="feature">Feature</option>
                    <option value="bug">Bug</option>
                    <option value="refactor">Refactor</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Action Modal: Add Invoice */}
      {activeModal === 'add-invoice' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>Issue New Invoice</h2>
            <form onSubmit={handleAddInvoiceSubmit}>
              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  value={invClientName} 
                  onChange={(e) => setInvClientName(e.target.value)} 
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Client Email</label>
                <input 
                  type="email" 
                  required 
                  className="form-input" 
                  value={invClientEmail} 
                  onChange={(e) => setInvClientEmail(e.target.value)} 
                  placeholder="e.g. sarah@bmo.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Amount (USD)</label>
                <input 
                  type="number" 
                  required 
                  className="form-input" 
                  value={invAmount} 
                  onChange={(e) => setInvAmount(e.target.value)} 
                  placeholder="e.g. 1500"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  rows={3} 
                  className="form-textarea" 
                  value={invDesc} 
                  onChange={(e) => setInvDesc(e.target.value)} 
                  placeholder="e.g. Cloud Lambda Gateway Migration POC"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Action Modal: Log Lead */}
      {activeModal === 'add-lead' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>Log New Lead</h2>
            <form onSubmit={handleAddLeadSubmit}>
              <div className="form-group">
                <label className="form-label">Lead Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  value={leadName} 
                  onChange={(e) => setLeadName(e.target.value)} 
                  placeholder="e.g. Marcus Reynolds"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="form-input" 
                  value={leadEmail} 
                  onChange={(e) => setLeadEmail(e.target.value)} 
                  placeholder="e.g. marcus@apex.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Project Requirements</label>
                <textarea 
                  rows={4} 
                  className="form-textarea" 
                  value={leadGoals} 
                  onChange={(e) => setLeadGoals(e.target.value)} 
                  placeholder="Describe requirements..."
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Log Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
