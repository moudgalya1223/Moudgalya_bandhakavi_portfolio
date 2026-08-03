'use client';

import { useState, useEffect } from 'react';
import { subscribeToLeads, updateLead, deleteLead, Lead } from '@/lib/firestore';
import { Mail, Calendar, ArrowRight, ArrowLeft, Trash, FileText, CheckCircle2, User, ChevronRight } from 'lucide-react';

export default function ClientsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    return subscribeToLeads(setLeads);
  }, []);

  const handleMoveStage = async (id: string, newStage: Lead['stage']) => {
    await updateLead(id, { stage: newStage });
    // Update local state if selected to avoid mismatch
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead((prev) => prev ? { ...prev, stage: newStage } : null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      await deleteLead(id);
      setSelectedLead(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead || !selectedLead.id) return;
    await updateLead(selectedLead.id, { notes: notesText });
    setSelectedLead((prev) => prev ? { ...prev, notes: notesText } : null);
    alert('Notes saved successfully');
  };

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, stage: Lead['stage']) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      await handleMoveStage(id, stage);
    }
  };

  const stages: { key: Lead['stage']; label: string }[] = [
    { key: 'inquiry', label: 'Inquiry' },
    { key: 'call', label: 'Call Scheduled' },
    { key: 'proposal', label: 'Proposal Sent' },
    { key: 'active', label: 'Active Client' },
  ];

  const getStageLeads = (stageKey: Lead['stage']) => {
    return leads.filter((l) => l.stage === stageKey);
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Clients & Leads Pipeline</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Track potential client conversions from initial bookings to signed agreements. Drag cards to update stages.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', alignItems: 'start', marginBottom: '40px' }}>
        {stages.map((stage) => {
          const stageLeads = getStageLeads(stage.key);
          return (
            <div 
              key={stage.key}
              className="glass-card" 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.key)}
              style={{ padding: '16px', background: 'rgba(19, 25, 46, 0.4)', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-cyan)' }}>
                  {stage.label}
                </h3>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '99px' }}>
                  {stageLeads.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => lead.id && handleDragStart(e, lead.id)}
                    onClick={() => {
                      setSelectedLead(lead);
                      setNotesText(lead.notes || '');
                    }}
                    style={{ padding: '12px', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                    className="lead-card"
                  >
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={12} className="text-purple" />
                      <span>{lead.name}</span>
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {lead.projectType} — {lead.budget}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {lead.meetingDate ? 'Call Scheduled' : 'New Lead'}
                      </span>
                      <div style={{ display: 'flex', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                        {stage.key !== 'inquiry' && (
                          <button 
                            onClick={() => lead.id && handleMoveStage(lead.id, stage.key === 'active' ? 'proposal' : stage.key === 'proposal' ? 'call' : 'inquiry')}
                            style={{ padding: '3px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            aria-label="Move left"
                          >
                            <ArrowLeft size={10} />
                          </button>
                        )}
                        {stage.key !== 'active' && (
                          <button 
                            onClick={() => lead.id && handleMoveStage(lead.id, stage.key === 'inquiry' ? 'call' : stage.key === 'call' ? 'proposal' : 'active')}
                            style={{ padding: '3px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            aria-label="Move right"
                          >
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Lead Deep Dive / Meeting Notes Logger */}
      {selectedLead && (
        <div className="glass-card" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Lead Profile: {selectedLead.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{selectedLead.email}</span>
                <span>•</span>
                <span>Budget: {selectedLead.budget}</span>
                <span>•</span>
                <span>Interest: {selectedLead.projectType}</span>
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Update Status Stage:</label>
                <select
                  className="form-select"
                  value={selectedLead.stage || 'inquiry'}
                  onChange={(e) => selectedLead.id && handleMoveStage(selectedLead.id, e.target.value as Lead['stage'])}
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  <option value="inquiry">Inquiry Received</option>
                  <option value="call">Call Scheduled</option>
                  <option value="proposal">Proposal Under Review</option>
                  <option value="active">Active Client / Approved</option>
                </select>
              </div>

              <button 
                onClick={() => selectedLead.id && handleDelete(selectedLead.id)} 
                className="btn btn-secondary" 
                style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.2)', padding: '6px 12px', fontSize: '0.8rem', marginTop: '18px' }}
              >
                <Trash size={14} />
                <span>Delete Lead</span>
              </button>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '30px', marginBottom: '24px' }}>
            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--accent-cyan)' }}>Screening Survey Answers</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedLead.goals || 'No survey questionnaire content provided.'}
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--accent-purple)' }}>Lead Meeting Notes</h3>
              <textarea
                rows={5}
                className="form-textarea"
                placeholder="Log customer requirements, scoping specifications, and milestones..."
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                style={{ fontSize: '0.85rem', marginBottom: '16px' }}
              />
              <button className="btn btn-primary" onClick={handleSaveNotes} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Save Meeting Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
