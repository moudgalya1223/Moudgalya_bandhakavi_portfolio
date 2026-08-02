'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Award, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="hero-section" id="about">
      {/* Background glow effects */}
      <div className="ambient-glow glow-purple" />
      <div className="ambient-glow glow-cyan" />

      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-tagline">
              <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span>GDG Active Member & Google Cloud AI Certificate Holder</span>
            </div>
            <h1 className="hero-title">
              Crafting Robust Solutions. <span>Boosting Your Development.</span>
            </h1>
            <p className="hero-desc">
              I am Moudgalya Bandhakavi, a Full-Stack & AI Engineer with 4 years of experience building secure fintech platforms, migrating enterprise services to AWS Cloud, and implementing custom computer vision systems.
            </p>

            <div className="hero-buttons" style={{ marginBottom: '32px' }}>
              <a href="#booking" className="btn btn-primary">
                Book a Consultation
              </a>
              <Link href="/login" className="btn btn-secondary">
                Client Login
              </Link>
            </div>

            {/* Google Cloud Event Spotlight Card */}
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '14px', 
                padding: '12px 18px', 
                background: 'rgba(19, 25, 46, 0.7)', 
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(6, 182, 212, 0.25)', 
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--accent-cyan)', flexShrink: 0 }}>
                <Image 
                  src="/google_cloud_event.png" 
                  alt="Google Cloud Event" 
                  fill 
                  style={{ objectFit: 'cover', objectPosition: 'right top' }} 
                />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={14} style={{ color: 'var(--accent-cyan)' }} />
                  <span>Google Cloud AI Roadshow & DevFest</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Certified by Google Cloud Kochi • AWS Certified Practitioner
                </div>
              </div>
            </div>
          </div>

          <div className="hero-avatar-container">
            <div className="hero-avatar-ring">
              <Image
                src="/moudgalya_headshot.png"
                alt="Moudgalya Bandhakavi"
                width={320}
                height={320}
                className="hero-avatar-img"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
