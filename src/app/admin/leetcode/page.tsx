'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToLeetCodeProblems,
  addLeetCodeProblem,
  updateLeetCodeProblem,
  deleteLeetCodeProblem,
  getLeetCodeSettings,
  saveLeetCodeSettings,
  subscribeToLeetCodeSettings,
  LeetCodeProblem,
  LeetCodeSettings,
} from '@/lib/firestore';
import {
  Code2,
  Plus,
  RefreshCw,
  Trash,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  BookOpen,
  Settings as SettingsIcon,
  ShieldAlert,
  Sparkles,
  Search,
  Filter,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function LeetCodeDashboardPage() {
  const [problems, setProblems] = useState<LeetCodeProblem[]>([]);
  const [settings, setSettings] = useState<LeetCodeSettings>(getLeetCodeSettings());
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);

  // Add problem form
  const [inputUrl, setInputUrl] = useState('');
  const [addStatus, setAddStatus] = useState<'todo' | 'inprogress'>('inprogress');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Settings form
  const [usernameInput, setUsernameInput] = useState(settings.username || '');
  const [autoSyncInput, setAutoSyncInput] = useState(settings.autoSync);
  const [flagInput, setFlagInput] = useState(settings.featureEnabled);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [copiedScript, setCopiedScript] = useState(false);

  // Subscribe to Firestore / LocalStorage
  useEffect(() => {
    const unsubProb = subscribeToLeetCodeProblems(setProblems);
    const unsubSet = subscribeToLeetCodeSettings((s) => {
      setSettings(s);
      setUsernameInput(s.username || '');
      setAutoSyncInput(s.autoSync);
      setFlagInput(s.featureEnabled);
    });
    return () => {
      unsubProb();
      unsubSet();
    };
  }, []);

  // Sync with LeetCode API
  const handleSyncWithLeetCode = useCallback(async (customUsername?: string) => {
    const targetUsername = customUsername || settings.username;
    if (!targetUsername) return;

    setSyncing(true);
    try {
      const res = await fetch('/api/leetcode/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: targetUsername, limit: 30 }),
      });

      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();

      if (data.syncedProblems && Array.isArray(data.syncedProblems)) {
        const currentProblems = [...problems];

        for (const item of data.syncedProblems) {
          const existing = currentProblems.find((p) => p.titleSlug === item.titleSlug);

          if (existing) {
            // If submitted & accepted on LeetCode -> move to DONE
            if (item.isAccepted && existing.status !== 'done') {
              await updateLeetCodeProblem(existing.id!, {
                status: 'done',
                solvedAt: new Date(item.timestamp).toLocaleString(),
                lastSubmissionLang: item.lang,
              });
            } else if (!item.isAccepted && existing.status === 'todo') {
              // If attempted -> move from todo to inprogress
              await updateLeetCodeProblem(existing.id!, {
                status: 'inprogress',
              });
            }
          } else {
            // Auto-discovery: Problem was attempted/solved on LeetCode but not yet on board!
            // Fetch problem metadata and add it automatically
            try {
              const metaRes = await fetch('/api/leetcode/problem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: item.titleSlug }),
              });
              if (metaRes.ok) {
                const meta = await metaRes.json();
                await addLeetCodeProblem({
                  title: meta.title,
                  titleSlug: meta.titleSlug,
                  url: meta.url,
                  difficulty: meta.difficulty,
                  tags: meta.tags,
                  status: item.isAccepted ? 'done' : 'inprogress',
                  order: Date.now(),
                  solvedAt: item.isAccepted ? new Date(item.timestamp).toLocaleString() : undefined,
                  lastSubmissionLang: item.lang,
                });
              }
            } catch (err) {
              console.error('Error auto-adding problem metadata:', err);
            }
          }
        }

        const now = new Date().toLocaleTimeString();
        setLastSyncTime(now);
        await saveLeetCodeSettings({ lastSynced: now });
      }
    } catch (err) {
      console.error('LeetCode sync error:', err);
    } finally {
      setSyncing(false);
    }
  }, [settings.username, problems]);

  // Auto-sync polling every 60 seconds if enabled
  useEffect(() => {
    if (!settings.featureEnabled || !settings.autoSync || !settings.username) return;

    // Trigger immediate sync on load
    handleSyncWithLeetCode();

    const interval = setInterval(() => {
      handleSyncWithLeetCode();
    }, 60000);

    return () => clearInterval(interval);
  }, [settings.featureEnabled, settings.autoSync, settings.username, handleSyncWithLeetCode]);

  // Add problem manually or via URL
  const handleAddProblemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) return;

    setAddLoading(true);
    setAddError('');

    try {
      const res = await fetch('/api/leetcode/problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch problem metadata');
      }

      await addLeetCodeProblem({
        title: data.title,
        titleSlug: data.titleSlug,
        url: data.url,
        difficulty: data.difficulty,
        tags: data.tags,
        status: addStatus, // defaults to inprogress as requested
        order: Date.now(),
      });

      setInputUrl('');
      setShowAddModal(false);
    } catch (err: any) {
      setAddError(err.message || 'Could not add problem');
    } finally {
      setAddLoading(false);
    }
  };

  // Move status handler
  const handleMoveStatus = async (id: string, newStatus: LeetCodeProblem['status']) => {
    await updateLeetCodeProblem(id, { status: newStatus });
  };

  // Delete problem handler
  const handleDelete = async (id: string) => {
    if (confirm('Remove this problem from your taskboard?')) {
      await deleteLeetCodeProblem(id);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = async (e: React.DragEvent, status: LeetCodeProblem['status']) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      await handleMoveStatus(id, status);
    }
  };

  // Save Settings handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveLeetCodeSettings({
      username: usernameInput.trim(),
      autoSync: autoSyncInput,
      featureEnabled: flagInput,
    });
    setShowSettingsModal(false);
    if (usernameInput.trim()) {
      handleSyncWithLeetCode(usernameInput.trim());
    }
  };

  // Helper code for Tampermonkey / Browser extension
  const userScriptCode = `// ==UserScript==
// @name         LeetCode Taskboard Auto-Tracker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically logs active LeetCode problems to your Admin Taskboard
// @match        https://leetcode.com/problems/*
// @grant        none
// ==UserScript==

(function() {
    'use me strict';
    const path = window.location.pathname;
    const match = path.match(/\\/problems\\/([^\\/]+)/);
    if (match && match[1]) {
        const slug = match[1];
        fetch('${typeof window !== 'undefined' ? window.location.origin : ''}/api/leetcode/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titleSlug: slug, status: 'inprogress' })
        }).catch(() => {});
    }
})();`;

  const copyScript = () => {
    navigator.clipboard.writeText(userScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // IF FEATURE FLAG IS DISABLED
  if (!settings.featureEnabled) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <ShieldAlert size={32} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '10px' }}>LeetCode Taskboard is Disabled</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', marginBottom: '24px', lineHeight: 1.6 }}>
          The LeetCode integration feature flag is currently turned off. To enable this feature and view your LeetCode problem board, turn on the flag in Settings.
        </p>
        <button
          className="btn btn-primary"
          onClick={async () => {
            await saveLeetCodeSettings({ featureEnabled: true });
          }}
        >
          <Sparkles size={16} />
          <span>Enable LeetCode Board</span>
        </button>
      </div>
    );
  }

  // Filter problems based on search and difficulty
  const filteredProblems = problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.titleSlug.includes(searchQuery.toLowerCase()) || (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesDiff = difficultyFilter === 'all' || p.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDiff;
  });

  const todoTasks = filteredProblems.filter((p) => p.status === 'todo');
  const inProgressTasks = filteredProblems.filter((p) => p.status === 'inprogress');
  const doneTasks = filteredProblems.filter((p) => p.status === 'done');

  // Stats calculation
  const totalCount = problems.length;
  const doneCount = problems.filter((p) => p.status === 'done').length;
  const inProgressCount = problems.filter((p) => p.status === 'inprogress').length;
  const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
  const mediumCount = problems.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy': return '#10b981'; // Green
      case 'medium': return '#f59e0b'; // Amber
      case 'hard': return '#ef4444'; // Red
      default: return 'var(--text-secondary)';
    }
  };

  const renderColumn = (columnTitle: string, colTasks: LeetCodeProblem[], columnStatus: LeetCodeProblem['status'], badgeColor: string) => {
    return (
      <div
        className="kanban-column glass-card"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, columnStatus)}
        style={{ minHeight: '520px', display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: badgeColor }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{columnTitle}</h3>
          </div>
          <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', padding: '2px 10px', borderRadius: '99px', border: '1px solid var(--border-color)', fontWeight: 600 }}>
            {colTasks.length}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto' }}>
          {colTasks.length === 0 ? (
            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No problems in {columnTitle}
            </div>
          ) : (
            colTasks.map((p) => (
              <div
                key={p.id}
                draggable
                onDragStart={(e) => p.id && handleDragStart(e, p.id)}
                className="kanban-card"
                style={{
                  padding: '16px',
                  background: 'rgba(15, 23, 42, 0.45)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'grab',
                  transition: 'var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: `${getDifficultyColor(p.difficulty)}15`,
                      color: getDifficultyColor(p.difficulty),
                      border: `1px solid ${getDifficultyColor(p.difficulty)}30`,
                    }}
                  >
                    {p.difficulty}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--accent-cyan)', opacity: 0.8 }}
                        title="Open on LeetCode"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                    <button
                      onClick={() => p.id && handleDelete(p.id)}
                      style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
                      title="Delete problem"
                    >
                      <Trash size={13} />
                    </button>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', lineHeight: 1.4 }}>{p.title}</h4>

                {/* Topic tags */}
                {p.tags && p.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                    {p.tags.slice(0, 3).map((t, idx) => (
                      <span key={idx} style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Status indicator & language */}
                {p.status === 'done' && p.solvedAt && (
                  <div style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                    <CheckCircle2 size={12} />
                    <span>Solved {p.lastSubmissionLang ? `in ${p.lastSubmissionLang}` : ''}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={10} />
                    <span>{p.solvedAt ? p.solvedAt.split(',')[0] : 'Active'}</span>
                  </span>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    {columnStatus !== 'todo' && (
                      <button
                        onClick={() => p.id && handleMoveStatus(p.id, columnStatus === 'done' ? 'inprogress' : 'todo')}
                        style={{ padding: '4px 6px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        title="Move left"
                      >
                        <ArrowLeft size={11} />
                      </button>
                    )}
                    {columnStatus !== 'done' && (
                      <button
                        onClick={() => p.id && handleMoveStatus(p.id, columnStatus === 'todo' ? 'inprogress' : 'done')}
                        style={{ padding: '4px 6px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        title="Move right"
                      >
                        <ArrowRight size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="admin-header" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', padding: '8px', borderRadius: '10px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code2 size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>LeetCode Taskboard</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                Auto-syncs problem states when you open or solve problems on LeetCode.com.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => handleSyncWithLeetCode()}
            disabled={syncing || !settings.username}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>

          <button className="btn btn-secondary" onClick={() => setShowScriptModal(true)} title="Auto-Tracker Script">
            <Sparkles size={16} />
            <span>Auto Tracker</span>
          </button>

          <button className="btn btn-secondary" onClick={() => setShowSettingsModal(true)}>
            <SettingsIcon size={16} />
            <span>Settings</span>
          </button>

          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Add Problem</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Total Tracked</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>{totalCount}</div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Solved Problems</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: '#10b981' }}>{doneCount}</div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>In Progress</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: '#f59e0b' }}>{inProgressCount}</div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Difficulty Breakdown</div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
            <span style={{ color: '#10b981' }}>{easyCount} E</span>
            <span style={{ color: '#f59e0b' }}>{mediumCount} M</span>
            <span style={{ color: '#ef4444' }}>{hardCount} H</span>
          </div>
        </div>
      </div>

      {/* Sync Alert Banner if Username is not configured */}
      {!settings.username && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', padding: '14px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b' }}>
            <ShieldAlert size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Set your LeetCode Username in Settings to enable automatic solution detection!</span>
          </div>
          <button className="btn btn-secondary" onClick={() => setShowSettingsModal(true)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            Configure Username
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search problems by title, slug, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy Only</option>
          <option value="medium">Medium Only</option>
          <option value="hard">Hard Only</option>
        </select>
      </div>

      {/* Kanban Board Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {renderColumn('To-Do', todoTasks, 'todo', '#3b82f6')}
        {renderColumn('In Progress', inProgressTasks, 'inprogress', '#f59e0b')}
        {renderColumn('Completed', doneTasks, 'done', '#10b981')}
      </div>

      {/* Add Problem Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>Add LeetCode Problem</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Paste any LeetCode problem URL or title slug. Metadata will be auto-fetched!
            </p>

            <form onSubmit={handleAddProblemSubmit}>
              <div className="form-group">
                <label className="form-label">LeetCode URL or Slug</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. https://leetcode.com/problems/two-sum/ or 3sum"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial State</label>
                <select
                  className="form-select"
                  value={addStatus}
                  onChange={(e: any) => setAddStatus(e.target.value)}
                >
                  <option value="inprogress">In Progress (Default)</option>
                  <option value="todo">To-Do</option>
                </select>
              </div>

              {addError && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '16px' }}>
                  {addError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addLoading}>
                  {addLoading ? 'Fetching Details...' : 'Add to Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>LeetCode Integration Settings</h2>

            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label className="form-label">LeetCode Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. john_doe"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Used to sync recent accepted submissions automatically from LeetCode.
                </p>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Auto-Sync Submissions</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Periodically check LeetCode API in background</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSyncInput(!autoSyncInput)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: autoSyncInput ? '#10b981' : 'var(--text-muted)' }}
                >
                  {autoSyncInput ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Feature Flag (Enable Board)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Turn off to hide LeetCode page from application</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFlagInput(!flagInput)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: flagInput ? '#10b981' : 'var(--text-muted)' }}
                >
                  {flagInput ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSettingsModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-Tracker Browser Script Modal */}
      {showScriptModal && (
        <div className="modal-overlay" onClick={() => setShowScriptModal(false)}>
          <div className="modal-content glass-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '10px' }}>Instant Browser Auto-Tracker</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.5 }}>
              Install this script in Tampermonkey or Violentmonkey. Whenever you open any problem tab on <code>leetcode.com</code>, it automatically logs it to your board in <strong>In Progress</strong>!
            </p>

            <div style={{ position: 'relative', background: '#090d16', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem', fontFamily: 'monospace', color: '#38bdf8', overflowX: 'auto', maxHeight: '220px', marginBottom: '20px' }}>
              <pre style={{ margin: 0 }}>{userScriptCode}</pre>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={copyScript}>
                {copiedScript ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
                <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Script Code'}</span>
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setShowScriptModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
