import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Lead {
  id?: string;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  goals: string;
  stage?: 'inquiry' | 'call' | 'proposal' | 'active';
  createdAt?: any;
  notes?: string;
  meetingDate?: string;
}

export interface Project {
  id?: string;
  name: string;
  client: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  description: string;
  startDate: string;
  endDate?: string;
  contractUrl?: string;
  createdAt?: any;
}

export interface Task {
  id?: string;
  title: string;
  projectId?: string;
  projectName?: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  type: 'bug' | 'feature' | 'refactor' | 'other';
  dueDate?: string;
  description?: string;
  order: number;
  createdAt?: any;
}

export interface Invoice {
  id?: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  description: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  stripePaymentLink?: string;
  createdAt?: any;
}

// ─── Initial Mock/Seed Data for Instant UI Fallback ─────────────────────────

const initialLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Sarah Jenkins',
    email: 'sarah@bmo.com',
    projectType: 'MVP',
    budget: '$5k–$15k',
    goals: 'Looking for Angular/Node fullstack setup for Canadian bank KYC tool.',
    stage: 'call',
    meetingDate: 'Tomorrow at 10:00 AM',
    notes: 'Initial scope reviewed. Preparing technical proposal.',
  },
  {
    id: 'lead-2',
    name: 'Marcus Reynolds',
    email: 'marcus@apex.com',
    projectType: 'Architecture Review',
    budget: '$15k+',
    goals: 'AWS Cloud migration & serverless Lambda proxy setup.',
    stage: 'proposal',
    notes: 'Sent architecture review estimate.',
  },
];

const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'BMO Front-End KYC Verification',
    client: 'Canadian Bank BMO',
    progress: 60,
    status: 'active',
    description: 'Angular documentation portal for client investment declarations.',
    startDate: '2026-06-01',
    contractUrl: 'https://github.com',
  },
  {
    id: 'proj-2',
    name: 'AWS Migration Lambda Gateway',
    client: 'Apex Ledger',
    progress: 90,
    status: 'active',
    description: 'Node.js serverless proxy lambdas for external microservices.',
    startDate: '2026-05-15',
  },
  {
    id: 'proj-3',
    name: 'Vertex AI Receipt Scraper',
    client: 'BlogMart',
    progress: 100,
    status: 'completed',
    description: 'Firebase & Vision API OCR scraper model.',
    startDate: '2026-04-10',
  },
];

const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Code Lambda verification tests',
    status: 'inprogress',
    priority: 'high',
    type: 'feature',
    order: 1,
  },
  {
    id: 'task-2',
    title: 'Implement OAuth redirect flow',
    status: 'todo',
    priority: 'medium',
    type: 'feature',
    order: 2,
  },
  {
    id: 'task-3',
    title: 'Database migration script verification',
    status: 'done',
    priority: 'high',
    type: 'refactor',
    order: 3,
  },
];

const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    clientName: 'Apex Ledger Corp',
    clientEmail: 'billing@apex.com',
    amount: 1700,
    currency: 'USD',
    description: 'AWS Lambda Middleware Migration Sprint 2',
    status: 'paid',
    dueDate: '2026-07-28',
    stripePaymentLink: 'https://checkout.stripe.com/pay/mock_link',
  },
  {
    id: 'inv-2',
    clientName: 'BlogMart Automations',
    clientEmail: 'dave@blogmart.com',
    amount: 2500,
    currency: 'USD',
    description: 'Vertex AI Receipt Scraper Model Deployment',
    status: 'sent',
    dueDate: '2026-08-10',
    stripePaymentLink: 'https://checkout.stripe.com/pay/mock_link',
  },
];

// Helper to safely get/set LocalStorage memory store
function getLocal<T>(key: string, initial: T[]): T[] {
  if (typeof window === 'undefined') return initial;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initial;
  } catch {
    return initial;
  }
}

function setLocal<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// ─── LEADS ──────────────────────────────────────────────────────────────────

export async function addLead(lead: Omit<Lead, 'id' | 'createdAt'>) {
  const newLead: Lead = {
    ...lead,
    id: 'lead-' + Date.now(),
    stage: lead.stage || 'inquiry',
    createdAt: new Date().toISOString(),
  };

  // Update local memory first for instant UI response
  const current = getLocal<Lead>('leads_store', initialLeads);
  const updated = [newLead, ...current];
  setLocal('leads_store', updated);

  // Dispatch custom window event to notify subscribers instantly
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('leads_updated'));
  }

  // Also attempt Firestore async write without blocking
  try {
    addDoc(collection(db, 'leads'), {
      ...lead,
      stage: lead.stage || 'inquiry',
      createdAt: serverTimestamp(),
    }).catch(() => {});
  } catch {}

  return newLead;
}

export function subscribeToLeads(cb: (leads: Lead[]) => void) {
  const notify = () => cb(getLocal<Lead>('leads_store', initialLeads));
  notify();

  if (typeof window !== 'undefined') {
    window.addEventListener('leads_updated', notify);
  }

  // Firestore sync listener
  try {
    const unsub = onSnapshot(
      query(collection(db, 'leads'), orderBy('createdAt', 'desc')),
      (snap) => {
        if (!snap.empty) {
          const fsLeads = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lead));
          cb(fsLeads);
          setLocal('leads_store', fsLeads);
        }
      },
      () => {} // Silent fallback error handler
    );
    return () => {
      unsub();
      if (typeof window !== 'undefined') window.removeEventListener('leads_updated', notify);
    };
  } catch {
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('leads_updated', notify);
    };
  }
}

export async function updateLead(id: string, data: Partial<Lead>) {
  const current = getLocal<Lead>('leads_store', initialLeads);
  const updated = current.map((l) => (l.id === id ? { ...l, ...data } : l));
  setLocal('leads_store', updated);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('leads_updated'));

  try {
    updateDoc(doc(db, 'leads', id), data).catch(() => {});
  } catch {}
}

export async function deleteLead(id: string) {
  const current = getLocal<Lead>('leads_store', initialLeads);
  const updated = current.filter((l) => l.id !== id);
  setLocal('leads_store', updated);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('leads_updated'));

  try {
    deleteDoc(doc(db, 'leads', id)).catch(() => {});
  } catch {}
}

// ─── PROJECTS ───────────────────────────────────────────────────────────────

export async function addProject(project: Omit<Project, 'id' | 'createdAt'>) {
  const newProj: Project = {
    ...project,
    id: 'proj-' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  const current = getLocal<Project>('projects_store', initialProjects);
  const updated = [newProj, ...current];
  setLocal('projects_store', updated);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('projects_updated'));

  try {
    addDoc(collection(db, 'projects'), { ...project, createdAt: serverTimestamp() }).catch(() => {});
  } catch {}

  return newProj;
}

export function subscribeToProjects(cb: (projects: Project[]) => void) {
  const notify = () => cb(getLocal<Project>('projects_store', initialProjects));
  notify();

  if (typeof window !== 'undefined') {
    window.addEventListener('projects_updated', notify);
  }

  try {
    const unsub = onSnapshot(
      query(collection(db, 'projects'), orderBy('createdAt', 'desc')),
      (snap) => {
        if (!snap.empty) {
          const fsProjects = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
          cb(fsProjects);
          setLocal('projects_store', fsProjects);
        }
      },
      () => {}
    );
    return () => {
      unsub();
      if (typeof window !== 'undefined') window.removeEventListener('projects_updated', notify);
    };
  } catch {
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('projects_updated', notify);
    };
  }
}

export async function updateProject(id: string, data: Partial<Project>) {
  const current = getLocal<Project>('projects_store', initialProjects);
  const updated = current.map((p) => (p.id === id ? { ...p, ...data } : p));
  setLocal('projects_store', updated);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('projects_updated'));

  try {
    updateDoc(doc(db, 'projects', id), data).catch(() => {});
  } catch {}
}

export async function deleteProject(id: string) {
  const current = getLocal<Project>('projects_store', initialProjects);
  const updated = current.filter((p) => p.id !== id);
  setLocal('projects_store', updated);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('projects_updated'));

  try {
    deleteDoc(doc(db, 'projects', id)).catch(() => {});
  } catch {}
}

// ─── TASKS ──────────────────────────────────────────────────────────────────

export async function addTask(task: Omit<Task, 'id' | 'createdAt'>) {
  const newTask: Task = {
    ...task,
    id: 'task-' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  const current = getLocal<Task>('tasks_store', initialTasks);
  const updated = [...current, newTask];
  setLocal('tasks_store', updated);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('tasks_updated'));

  try {
    addDoc(collection(db, 'tasks'), { ...task, createdAt: serverTimestamp() }).catch(() => {});
  } catch {}

  return newTask;
}

export function subscribeToTasks(cb: (tasks: Task[]) => void) {
  const notify = () => cb(getLocal<Task>('tasks_store', initialTasks));
  notify();

  if (typeof window !== 'undefined') {
    window.addEventListener('tasks_updated', notify);
  }

  try {
    const unsub = onSnapshot(
      query(collection(db, 'tasks'), orderBy('order', 'asc')),
      (snap) => {
        if (!snap.empty) {
          const fsTasks = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
          cb(fsTasks);
          setLocal('tasks_store', fsTasks);
        }
      },
      () => {}
    );
    return () => {
      unsub();
      if (typeof window !== 'undefined') window.removeEventListener('tasks_updated', notify);
    };
  } catch {
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('tasks_updated', notify);
    };
  }
}

export async function updateTask(id: string, data: Partial<Task>) {
  const current = getLocal<Task>('tasks_store', initialTasks);
  const updated = current.map((t) => (t.id === id ? { ...t, ...data } : t));
  setLocal('tasks_store', updated);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('tasks_updated'));

  try {
    updateDoc(doc(db, 'tasks', id), data).catch(() => {});
  } catch {}
}

export async function deleteTask(id: string) {
  const current = getLocal<Task>('tasks_store', initialTasks);
  const updated = current.filter((t) => t.id !== id);
  setLocal('tasks_store', updated);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('tasks_updated'));

  try {
    deleteDoc(doc(db, 'tasks', id)).catch(() => {});
  } catch {}
}

// ─── INVOICES ───────────────────────────────────────────────────────────────

export async function addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>) {
  const newInvoice: Invoice = {
    ...invoice,
    id: 'inv-' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  const current = getLocal<Invoice>('invoices_store', initialInvoices);
  const updated = [newInvoice, ...current];
  setLocal('invoices_store', updated);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('invoices_updated'));

  try {
    addDoc(collection(db, 'invoices'), { ...invoice, createdAt: serverTimestamp() }).catch(() => {});
  } catch {}

  return newInvoice;
}

export function subscribeToInvoices(cb: (invoices: Invoice[]) => void) {
  const notify = () => cb(getLocal<Invoice>('invoices_store', initialInvoices));
  notify();

  if (typeof window !== 'undefined') {
    window.addEventListener('invoices_updated', notify);
  }

  try {
    const unsub = onSnapshot(
      query(collection(db, 'invoices'), orderBy('createdAt', 'desc')),
      (snap) => {
        if (!snap.empty) {
          const fsInvoices = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice));
          cb(fsInvoices);
          setLocal('invoices_store', fsInvoices);
        }
      },
      () => {}
    );
    return () => {
      unsub();
      if (typeof window !== 'undefined') window.removeEventListener('invoices_updated', notify);
    };
  } catch {
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('invoices_updated', notify);
    };
  }
}

export async function updateInvoice(id: string, data: Partial<Invoice>) {
  const current = getLocal<Invoice>('invoices_store', initialInvoices);
  const updated = current.map((i) => (i.id === id ? { ...i, ...data } : i));
  setLocal('invoices_store', updated);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('invoices_updated'));

  try {
    updateDoc(doc(db, 'invoices', id), data).catch(() => {});
  } catch {}
}

export async function deleteInvoice(id: string) {
  const current = getLocal<Invoice>('invoices_store', initialInvoices);
  const updated = current.filter((i) => i.id !== id);
  setLocal('invoices_store', updated);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('invoices_updated'));

  try {
    deleteDoc(doc(db, 'invoices', id)).catch(() => {});
  } catch {}
}
