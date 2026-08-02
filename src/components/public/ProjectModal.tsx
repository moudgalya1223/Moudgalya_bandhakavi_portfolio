'use client';

import { X, ExternalLink, Zap, Shield, HelpCircle, Layers } from 'lucide-react';

export interface ProjectData {
  id: string;
  title: string;
  category: string;
  desc: string;
  longDesc: string;
  problem: string;
  solution: string;
  tech: string[];
  metrics: { label: string; value: string }[];
  liveUrl?: string;
  githubUrl?: string;
}

interface ProjectModalProps {
  project: ProjectData;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" style={{ maxWidth: '750px', padding: 0 }}>
        {/* Header Image Placeholder */}
        <div style={{ height: '220px', background: 'linear-gradient(135deg, #1e1b4b 0%, #030712 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button 
            className="modal-close" 
            onClick={onClose} 
            aria-label="Close modal"
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '50%', color: 'white' }}
          >
            <X size={20} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <span className="project-tag" style={{ marginBottom: '10px', display: 'inline-block' }}>{project.category}</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{project.title}</h2>
          </div>
        </div>

        <div style={{ padding: '30px' }}>
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '30px' }}>
            {project.metrics.map((metric, i) => (
              <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{metric.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>{metric.label}</div>
              </div>
            ))}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '30px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)' }}>
                <HelpCircle size={18} />
                <span>The Challenge (Problem)</span>
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{project.problem}</p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)' }}>
                <Zap size={18} />
                <span>The Solution (Implementation)</span>
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{project.solution}</p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Layers size={18} />
                <span>Technology Stack Used</span>
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {project.tech.map((t) => (
                  <span key={t} className="project-tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flex: 1 }}>
                <ExternalLink size={16} />
                <span>Live Demo</span>
              </a>
            )}
            <button className="btn btn-secondary" onClick={onClose} style={{ flex: project.liveUrl ? 1 : 'none', width: project.liveUrl ? 'auto' : '120px' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
