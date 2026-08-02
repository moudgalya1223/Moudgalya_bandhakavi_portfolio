'use client';

import { Check } from 'lucide-react';

export default function ServicesTiers() {
  const tiers = [
    {
      name: 'Code Review & Audit',
      price: '$499',
      period: 'per audit',
      desc: 'Deep refactoring check, API performance audit, and database constraint analysis.',
      features: [
        'Security & dependency scanning',
        'Database optimization (Postgres/Firebase)',
        'Code refactoring roadmap',
        '1-hour architecture walkthrough call',
        'Next.js/Django stack focus',
      ],
      featured: false,
    },
    {
      name: 'MVP Launch Pad',
      price: '$1,999',
      period: 'per product',
      desc: 'Build and launch your web or mobile app prototype in weeks with verified stack components.',
      features: [
        'Interactive React/Angular front-end',
        'Firebase/PostgreSQL cloud database setup',
        'Google/AWS Cloud serverless deployment',
        'Stripe payment gateway integration',
        '30-day post-launch support',
      ],
      featured: true,
    },
    {
      name: 'Ongoing Fractional Dev',
      price: '$1,499',
      period: 'per month',
      desc: 'Dedicated weekly engineering capacity to expand your product features, code refactoring, and mentor junior devs.',
      features: [
        '15-20 hours of focused coding per week',
        'DevOps cloud migration & Lambdas support',
        'Agile Scrum participation',
        'Junior engineer code reviews & pair programming',
        'Priority Slack & email communication',
      ],
      featured: false,
    },
  ];

  return (
    <section className="services-section" id="services">
      <div className="container">
        <h2 className="section-title">Consulting Services & Tiers</h2>
        <p className="section-subtitle">
          Professional, outcomes-focused engineering plans designed to launch products, modernize tech infrastructure, and scale team velocity.
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

              <a 
                href="#booking" 
                className={`btn ${tier.featured ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', marginTop: 'auto', display: 'block', textAlign: 'center' }}
              >
                Select Package
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
