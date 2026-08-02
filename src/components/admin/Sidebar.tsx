'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';
import { 
  LayoutDashboard, 
  FolderGit2, 
  CheckSquare, 
  CircleDollarSign, 
  Users2, 
  Settings as SettingsIcon,
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { label: 'Overview', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Projects', href: '/admin/projects', icon: <FolderGit2 size={20} /> },
    { label: 'Tasks', href: '/admin/tasks', icon: <CheckSquare size={20} /> },
    { label: 'Finance', href: '/admin/finance', icon: <CircleDollarSign size={20} /> },
    { label: 'Clients', href: '/admin/clients', icon: <Users2 size={20} /> },
    { label: 'Settings', href: '/admin/settings', icon: <SettingsIcon size={20} /> },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">MB</div>
        <div className="brand-text">
          <h2>Moudgalya B.</h2>
          <p>Admin Portal</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
              {isActive && <ChevronRight size={16} className="active-arrow" />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="signout-btn" onClick={handleSignOut}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
