'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Shield, UserCheck } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          MOUDGALYA<span>.B</span>
        </Link>

        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#expertise">Expertise</a>
          <a href="#projects">Projects</a>
          <a href="#services">Services</a>
          <a href="#booking" className="nav-cta">Book Consultation</a>
          <Link href="/login" className="nav-login" style={{ borderColor: 'rgba(6,182,212,0.3)', color: 'var(--accent-cyan)' }}>
            <UserCheck size={16} />
            <span>Client Portal</span>
          </Link>
          <Link href="/login?role=admin" className="nav-login">
            <Shield size={16} />
            <span>Admin</span>
          </Link>
        </div>

        <button className="nav-mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="nav-mobile-drawer">
          <a href="#about" onClick={() => setIsOpen(false)}>About</a>
          <a href="#expertise" onClick={() => setIsOpen(false)}>Expertise</a>
          <a href="#projects" onClick={() => setIsOpen(false)}>Projects</a>
          <a href="#services" onClick={() => setIsOpen(false)}>Services</a>
          <a href="#booking" className="mobile-cta" onClick={() => setIsOpen(false)}>Book Consultation</a>
          <Link href="/login" className="mobile-login" onClick={() => setIsOpen(false)}>
            Client Portal Login
          </Link>
          <Link href="/login?role=admin" className="mobile-login" onClick={() => setIsOpen(false)} style={{ borderColor: 'rgba(124, 58, 237, 0.4)', color: '#c084fc' }}>
            Admin Portal Access
          </Link>
        </div>
      )}
    </nav>
  );
}
