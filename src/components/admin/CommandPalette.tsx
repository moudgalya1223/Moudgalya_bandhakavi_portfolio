'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FolderGit2, CheckSquare, CircleDollarSign, Users2, ShieldAlert } from 'lucide-react';

interface CommandPaletteProps {
  onQuickAction: (action: string) => void;
}

export default function CommandPalette({ onQuickAction }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const items = [
    { label: 'Create New Task', icon: <CheckSquare size={16} />, category: 'Actions', action: () => onQuickAction('add-task') },
    { label: 'Issue Invoice (Stripe)', icon: <CircleDollarSign size={16} />, category: 'Actions', action: () => onQuickAction('add-invoice') },
    { label: 'Log Client Lead', icon: <Users2 size={16} />, category: 'Actions', action: () => onQuickAction('add-lead') },
    { label: 'Go to Overview', icon: <ShieldAlert size={16} />, category: 'Navigation', action: () => router.push('/admin') },
    { label: 'Go to Projects', icon: <FolderGit2 size={16} />, category: 'Navigation', action: () => router.push('/admin/projects') },
    { label: 'Go to Kanban Tasks', icon: <CheckSquare size={16} />, category: 'Navigation', action: () => router.push('/admin/tasks') },
    { label: 'Go to Finance', icon: <CircleDollarSign size={16} />, category: 'Navigation', action: () => router.push('/admin/finance') },
    { label: 'Go to Clients Pipeline', icon: <Users2 size={16} />, category: 'Navigation', action: () => router.push('/admin/clients') },
  ];

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: '15vh' }} onClick={() => setIsOpen(false)}>
      <div 
        className="glass-card" 
        style={{ maxWidth: '600px', width: '100%', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <Search size={20} style={{ color: 'var(--text-muted)', marginRight: '12px' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            style={{ width: '100%', fontSize: '1rem', background: 'none', border: 'none', color: 'var(--text-primary)', outline: 'none' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            ESC
          </span>
        </div>

        <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '12px' }}>
          {filteredItems.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '16px 8px', textAlign: 'center' }}>
              No commands found for "{query}"
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {['Actions', 'Navigation'].map((category) => {
                const categoryItems = filteredItems.filter((item) => item.category === category);
                if (categoryItems.length === 0) return null;
                return (
                  <div key={category}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-purple)', textTransform: 'uppercase', padding: '8px 12px 4px', letterSpacing: '0.05em' }}>
                      {category}
                    </div>
                    {categoryItems.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          item.action();
                          setIsOpen(false);
                        }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left', transition: 'var(--transition-fast)' }}
                        className="cmd-item"
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>{item.icon}</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
