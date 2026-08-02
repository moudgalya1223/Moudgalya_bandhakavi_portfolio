'use client';

import { useState, useEffect } from 'react';
import { subscribeToInvoices, addInvoice, updateInvoice, deleteInvoice, Invoice } from '@/lib/firestore';
import { Plus, Trash, ExternalLink, CircleDollarSign, Calendar, Mail, CheckCircle2 } from 'lucide-react';

export default function FinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    return subscribeToInvoices(setInvoices);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !amount) return;

    await addInvoice({
      clientName,
      clientEmail,
      amount: parseFloat(amount),
      currency: 'USD',
      description,
      status: 'sent',
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      stripePaymentLink: 'https://checkout.stripe.com/pay/mock_link',
    });

    setClientName('');
    setClientEmail('');
    setAmount('');
    setDescription('');
    setDueDate('');
    setShowAddModal(false);
  };

  const handleMarkPaid = async (id: string) => {
    await updateInvoice(id, { status: 'paid' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this invoice?')) {
      await deleteInvoice(id);
    }
  };

  // Finance calculations
  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);
  const totalSent = invoices
    .filter((i) => i.status === 'sent')
    .reduce((sum, i) => sum + i.amount, 0);

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'paid': return 'var(--accent-emerald)';
      case 'sent': return 'var(--accent-cyan)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Finance & Revenue Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Track client invoicing, send Stripe payment requests, and manage earnings.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Issue Invoice</span>
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid-3" style={{ marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', borderRadius: 'var(--radius-sm)' }}>
            <CircleDollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>${totalPaid.toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>Total Paid Earnings</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', borderRadius: 'var(--radius-sm)' }}>
            <CircleDollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>${totalSent.toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>Outstanding Invoices</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{invoices.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>Total Invoices Issued</div>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px' }}>Invoices Ledger</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Client</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Description</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Due Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No invoices issued. Click "Issue Invoice" above.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600 }}>{inv.clientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Mail size={10} />
                        <span>{inv.clientEmail}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{inv.description}</td>
                    <td style={{ padding: '16px', fontWeight: 700 }}>${inv.amount.toLocaleString()}</td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{inv.dueDate}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: getStatusColor(inv.status), background: 'rgba(255,255,255,0.02)', padding: '4px 10px', borderRadius: '99px', border: '1px solid var(--border-color)' }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '10px', alignItems: 'center' }}>
                        {inv.status === 'sent' && (
                          <button
                            onClick={() => inv.id && handleMarkPaid(inv.id)}
                            style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-emerald)', color: 'var(--accent-emerald)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                            title="Mark as Paid"
                          >
                            <CheckCircle2 size={12} />
                            <span>Paid</span>
                          </button>
                        )}
                        <a
                          href={inv.stripePaymentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                          title="View Payment Page"
                        >
                          <ExternalLink size={12} />
                        </a>
                        <button
                          onClick={() => inv.id && handleDelete(inv.id)}
                          style={{ color: 'var(--accent-rose)', cursor: 'pointer', padding: '4px' }}
                          title="Delete Invoice"
                          aria-label="Delete invoice"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>Issue Invoice</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  placeholder="e.g. John Doe"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Client Email</label>
                <input 
                  type="email" 
                  required 
                  className="form-input" 
                  placeholder="e.g. john@doe.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>

              <div className="grid-2" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Amount (USD)</label>
                  <input 
                    type="number" 
                    required 
                    className="form-input" 
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Invoice Description</label>
                <textarea 
                  rows={3} 
                  className="form-textarea" 
                  placeholder="Describe scope of deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
