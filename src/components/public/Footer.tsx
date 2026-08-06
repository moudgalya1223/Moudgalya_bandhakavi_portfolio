'use client';

import { ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a 
            href="https://topmate.io/bandhakavi_dattamoudglya" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: '#ff8c38', 
              fontSize: '0.9rem', 
              fontWeight: 600,
              padding: '6px 14px',
              background: 'rgba(255, 107, 0, 0.1)',
              border: '1px solid rgba(255, 107, 0, 0.25)',
              borderRadius: '20px'
            }}
          >
            <span>Book 1:1 on Topmate</span>
            <ExternalLink size={14} />
          </a>
        </div>
        <p className="footer-text">
          &copy; {currentYear} Moudgalya Bandhakavi. All rights reserved. Made for high-impact software engineering & AI solutions.
        </p>
      </div>
    </footer>
  );
}

