'use client';

import { useState, useEffect } from 'react';
import { subscribeToProjects, addProject, updateProject, deleteProject, Project } from '@/lib/firestore';
import { Plus, Check, Trash, Loader2, Link2, ExternalLink } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [contractUrl, setContractUrl] = useState('');

  useEffect(() => {
    return subscribeToProjects(setProjects);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !client) return;
    setLoading(true);
    try {
      await addProject({
        name,
        client,
        description,
        startDate,
        progress: 0,
        status: 'active',
        contractUrl: contractUrl || undefined,
      });
      setName('');
      setClient('');
      setDescription('');
      setStartDate('');
      setContractUrl('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProgressChange = async (id: string, progress: number) => {
    await updateProject(id, { progress });
  };

  const handleStatusChange = async (id: string, status: Project['status']) => {
    await updateProject(id, { status });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(id);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage Active Projects</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Track project deliverables, adjust progress timelines, and attach agreements.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid-2" style={{ gap: '30px' }}>
        {projects.length === 0 ? (
          <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            No projects found. Click "New Project" to initiate one.
          </div>
        ) : (
          projects.map((proj) => (
            <div key={proj.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Client: {proj.client}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>{proj.name}</h3>
                </div>
                <button 
                  onClick={() => proj.id && handleDelete(proj.id)} 
                  style={{ color: 'var(--accent-rose)', cursor: 'pointer', opacity: 0.7, padding: '4px' }}
                  aria-label="Delete project"
                >
                  <Trash size={16} />
                </button>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {proj.description || 'No description provided.'}
              </p>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span>Completion Status</span>
                  <span style={{ fontWeight: 700 }}>{proj.progress}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100"
                  style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
                  value={proj.progress}
                  onChange={(e) => proj.id && handleProgressChange(proj.id, parseInt(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    className="form-select"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto' }}
                    value={proj.status}
                    onChange={(e: any) => proj.id && handleStatusChange(proj.id, e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>

                {proj.contractUrl ? (
                  <a href={proj.contractUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <Link2 size={14} />
                    <span>View Contract</span>
                  </a>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Agreement Attached</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>Create Project</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  placeholder="e.g. Candy BMO Front-end KYC"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  placeholder="e.g. Canadian Bank BMO"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Description</label>
                <textarea 
                  rows={3}
                  className="form-textarea" 
                  placeholder="Enter scope details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid-2" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Agreement URL (e.g. DocuSign)</label>
                  <input 
                    type="url" 
                    className="form-input"
                    placeholder="https://docusign.com/..."
                    value={contractUrl}
                    onChange={(e) => setContractUrl(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
