'use client';

import { useState, useEffect } from 'react';
import { subscribeToTasks, addTask, updateTask, deleteTask, Task } from '@/lib/firestore';
import { Plus, Trash, ArrowRight, ArrowLeft, Bug, Lightbulb, Hammer, Calendar } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [type, setType] = useState<'bug' | 'feature' | 'refactor' | 'other'>('feature');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    return subscribeToTasks(setTasks);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    await addTask({
      title,
      priority,
      type,
      dueDate: dueDate || undefined,
      description: description || undefined,
      status: 'todo',
      order: Date.now(),
    });

    setTitle('');
    setPriority('medium');
    setType('feature');
    setDueDate('');
    setDescription('');
    setShowAddModal(false);
  };

  const handleMoveStatus = async (id: string, newStatus: Task['status']) => {
    await updateTask(id, { status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) {
      await deleteTask(id);
    }
  };

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      await handleMoveStatus(id, status);
    }
  };

  // Group tasks by status
  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'inprogress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'var(--accent-rose)';
      case 'medium': return 'var(--accent-cyan)';
      default: return 'var(--text-secondary)';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug size={14} style={{ color: 'var(--accent-rose)' }} />;
      case 'feature': return <Lightbulb size={14} style={{ color: 'var(--accent-cyan)' }} />;
      default: return <Hammer size={14} style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const renderColumn = (title: string, columnTasks: Task[], status: Task['status']) => {
    return (
      <div 
        className="kanban-column glass-card"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
        style={{ minHeight: '500px', display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
          <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border-color)' }}>
            {columnTasks.length}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {columnTasks.map((t) => (
            <div
              key={t.id}
              draggable
              onDragStart={(e) => t.id && handleDragStart(e, t.id)}
              style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'grab', transition: 'var(--transition-fast)' }}
              className="kanban-card"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {getIcon(t.type)}
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: getPriorityColor(t.priority) }}>
                    {t.priority}
                  </span>
                </div>
                <button 
                  onClick={() => t.id && handleDelete(t.id)} 
                  style={{ color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.7 }}
                  aria-label="Delete task"
                >
                  <Trash size={12} />
                </button>
              </div>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px', lineHeight: 1.4 }}>{t.title}</h4>
              
              {t.description && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>
                  {t.description}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
                {t.dueDate ? (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={10} />
                    <span>{t.dueDate}</span>
                  </span>
                ) : (
                  <span />
                )}

                <div style={{ display: 'flex', gap: '4px' }}>
                  {status !== 'todo' && (
                    <button 
                      onClick={() => t.id && handleMoveStatus(t.id, status === 'done' ? 'inprogress' : 'todo')}
                      style={{ padding: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}
                      aria-label="Move left"
                    >
                      <ArrowLeft size={10} />
                    </button>
                  )}
                  {status !== 'done' && (
                    <button 
                      onClick={() => t.id && handleMoveStatus(t.id, status === 'todo' ? 'inprogress' : 'done')}
                      style={{ padding: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}
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
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Kanban Task Board</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage sprints and project milestones. Drag & drop cards or use buttons to transition stages.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {renderColumn('To-Do', todoTasks, 'todo')}
        {renderColumn('In Progress', inProgressTasks, 'inprogress')}
        {renderColumn('Completed', doneTasks, 'done')}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>Add New Task</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  placeholder="e.g. Code Lambda verification tests"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea 
                  rows={3} 
                  className="form-textarea" 
                  placeholder="Enter details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid-3" style={{ gap: '16px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Priority</label>
                  <select 
                    className="form-select"
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
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
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                  >
                    <option value="feature">Feature</option>
                    <option value="bug">Bug</option>
                    <option value="refactor">Refactor</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
