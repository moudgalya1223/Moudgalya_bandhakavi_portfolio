'use client';

import { useState, useEffect } from 'react';
import { subscribeToProjects, subscribeToTasks, subscribeToInvoices, subscribeToLeads, Project, Task, Invoice, Lead } from '@/lib/firestore';
import { FolderGit2, CheckSquare, CircleDollarSign, Users, ChevronRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function Overview() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const unsubProjects = subscribeToProjects(setProjects);
    const unsubTasks = subscribeToTasks(setTasks);
    const unsubInvoices = subscribeToInvoices(setInvoices);
    const unsubLeads = subscribeToLeads(setLeads);

    return () => {
      unsubProjects();
      unsubTasks();
      unsubInvoices();
      unsubLeads();
    };
  }, []);

  // Compute stats
  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'done').length;
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingInvoicesAmount = invoices
    .filter((inv) => inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.amount, 0);

  // SVG Chart data
  const revenueData = [1200, 2400, 1800, 3500, 4800, 5200, 6800];
  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 10;
  
  // Create path points
  const points = revenueData.map((val, idx) => {
    const x = padding + (idx * (chartWidth - padding * 2)) / (revenueData.length - 1);
    const y = chartHeight - padding - (val * (chartHeight - padding * 2)) / 7000;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back, Moudgalya</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Here is a snapshot of your active pipeline, milestones, and billing.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(6, 182, 212, 0.2)', fontWeight: 600 }}>
            Press Ctrl+K for commands
          </span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid-4" style={{ marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-purple)', borderRadius: 'var(--radius-sm)' }}>
            <FolderGit2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{activeProjectsCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>Active Projects</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', borderRadius: 'var(--radius-sm)' }}>
            <CheckSquare size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{pendingTasksCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>Open Tasks</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', borderRadius: 'var(--radius-sm)' }}>
            <CircleDollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>${totalRevenue.toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>Earnings (Paid)</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-rose)', borderRadius: 'var(--radius-sm)' }}>
            <CircleDollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>${pendingInvoicesAmount.toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>Pending Invoices</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '30px', marginBottom: '40px' }}>
        {/* Finance Area Graph */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Monthly Earnings Graph</h2>
          <div style={{ width: '100%', height: '180px', position: 'relative', marginTop: 'auto' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke="var(--accent-cyan)"
                strokeWidth="3"
                points={points}
              />
              <path
                d={`M ${padding},${chartHeight - padding} L ${points} L ${chartWidth - padding},${chartHeight - padding} Z`}
                fill="url(#chartGlow)"
              />
              {/* Plot dot nodes */}
              {revenueData.map((val, idx) => {
                const x = padding + (idx * (chartWidth - padding * 2)) / (revenueData.length - 1);
                const y = chartHeight - padding - (val * (chartHeight - padding * 2)) / 7000;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="5"
                    fill="var(--bg-primary)"
                    stroke="var(--accent-purple)"
                    strokeWidth="2.5"
                  />
                );
              })}
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px', padding: '0 8px' }}>
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>
        </div>

        {/* Client Pipeline & Recent Leads */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Active Enquiries</h2>
            <Link href="/admin/clients" style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>View Pipeline</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leads.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>No new inquiries logged yet</p>
            ) : (
              leads.slice(0, 3).map((lead) => (
                <div key={lead.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{lead.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{lead.email}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: lead.stage === 'active' ? 'var(--accent-emerald)' : 'var(--accent-cyan)', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '99px', border: '1px solid var(--border-color)' }}>
                      {lead.stage}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Projects Tracker */}
      <div className="glass-card" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Project Deliverables & Milestones</h2>
          <Link href="/admin/projects" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            Manage Projects
          </Link>
        </div>

        <div className="grid-2" style={{ gap: '20px' }}>
          {projects.length === 0 ? (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No projects created yet. Press Ctrl+K to log a lead and convert it to a project.
            </div>
          ) : (
            projects.map((proj) => (
              <div key={proj.id} style={{ padding: '20px', background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{proj.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Client: {proj.client}</span>
                </div>
                {/* Progress bar */}
                <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ height: '100%', width: `${proj.progress}%`, background: 'linear-gradient(90deg, var(--accent-purple) 0%, var(--accent-cyan) 100%)', borderRadius: '99px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>{proj.progress}% Complete</span>
                  <span style={{ textTransform: 'capitalize' }}>Status: {proj.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
