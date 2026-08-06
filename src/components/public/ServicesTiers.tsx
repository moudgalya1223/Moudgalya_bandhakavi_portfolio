'use client';

import { Check } from 'lucide-react';

export default function ServicesTiers() {
  const tiers = [
    {
      name: 'Full-Stack Product & App Building',
      price: 'Custom USD ($)',
      period: 'project-based on size',
      desc: 'Complete end-to-end full-stack web or mobile application development tailored to your exact scope.',
      features: [
        'Interactive React / Next.js / Angular front-end',
        'Custom backend API & Database (Node/Python/Firebase/Postgres)',
        'Serverless cloud deployment (AWS/GCP/Vercel)',
        'Payment gateway & third-party API integrations',
        '30-day post-launch warranty & support',
      ],
      featured: true,
    },
    {
      name: 'Bug Fixes & Small Tasks',
      price: '$50 USD',
      period: 'per hour',
      desc: 'Rapid, targeted bug fixes, code troubleshooting, and small feature updates for existing applications.',
      features: [
        'Small bug fixes & emergency patch deployments',
        'UI/UX alignment & responsive layout fixes',
        'API error debugging & CORS resolution',
        'Database query tuning & state fix',
        'Hourly billing with transparent progress logs',
      ],
      featured: false,
    },
    {
      name: 'Code Review & Security Audit',
      price: 'Custom USD ($)',
      period: 'based on repo size',
      desc: 'Deep refactoring audit, API performance check, and database constraint analysis for scaling.',
      features: [
        'Security & dependency vulnerability scanning',
        'Database query optimization (Postgres/Firebase/MongoDB)',
        'Code refactoring & architecture roadmap',
        '1-hour architecture walkthrough call',
        'Full stack & cloud infrastructure audit report',
      ],
      featured: false,
    },
  ];

  return (
    <section className="services-section" id="services">
      <div className="container">
        <h2 className="section-title">Consulting Services & Tiers</h2>
        <p className="section-subtitle">
          Transparent USD ($) pricing. Flexible project-based pricing tailored to your project size & scope, with hourly options for small bug fixes.
        </p>

        <div className="grid-3 services-grid">
          {tiers.map((tier) => (
            <div 
              key={tier.name} 
              className={`glass-card service-card ${tier.featured ? 'featured' : ''}`}
            >
              {tier.featured && <span className="service-badge">Recommended</span>}
              <h3 className="service-name">{tier.name}</h3>
              <div className="service-price">
                {tier.price} <span>/ {tier.period}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '30px' }}>
                {tier.desc}
              </p>
              
              <ul className="service-features">
                {tier.features.map((feat, i) => (
                  <li key={i}>
                    <Check size={16} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <a 
                  href="#booking" 
                  className={`btn ${tier.featured ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Get Custom Quote
                </a>
                <a 
                  href="https://topmate.io/bandhakavi_dattamoudglya" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ width: '100%', textAlign: 'center', fontSize: '0.85rem', color: '#ff8c38', fontWeight: 600, padding: '4px 0', textDecoration: 'none' }}
                >
                  Or Book 1:1 on Topmate →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
