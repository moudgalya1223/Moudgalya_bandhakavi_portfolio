'use client';

import { useState } from 'react';
import ProjectModal, { ProjectData } from './ProjectModal';
import { ExternalLink, Database, Shield, Cpu, HelpCircle } from 'lucide-react';

interface ProjectsGridProps {
  selectedTag: string;
}

export default function ProjectsGrid({ selectedTag }: ProjectsGridProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  const projects: ProjectData[] = [
    {
      id: 'kyc-bmo',
      title: 'BMO KYC Documentation Portal',
      category: 'Full-Stack Development',
      desc: 'Developed a comprehensive secure client onboarding documentation system for Canadian Bank BMO.',
      longDesc: 'A secure financial KYC onboarding portal built to collect investment details and identity documentation safely. Integrated with background verification databases to streamline customer acquisition.',
      problem: 'The Canadian bank (BMO) needed a robust, highly secure front-end application to walk users through KYC verification, collecting complex investment details and declarations.',
      solution: 'Designed and implemented the front-end application in Angular, connecting to a backend microservice that securely stored, encrypted, and queried customer details in a PostgreSQL DB.',
      tech: ['Angular', 'Node.js', 'psql', 'React'],
      metrics: [
        { label: 'KYC Processing', value: '-40% Time' },
        { label: 'Regulatory Compliance', value: '100% Secure' },
        { label: 'User Rating', value: '4.8/5' },
      ],
      liveUrl: 'https://github.com',
    },
    {
      id: 'aws-migration',
      title: 'AWS Cloud Migration Gateway',
      category: 'Cloud Architecture & DevOps',
      desc: 'Built serverless Lambdas to proxy, throttle, and manage legacy system services during a major cloud migration.',
      longDesc: 'Developed and tracked serverless middleware architecture to migrate critical on-premise functions to AWS cloud Lambda services.',
      problem: 'Frequent, unthrottled API hits to old on-premise systems during database migration created latency bottlenecks and reliability concerns.',
      solution: 'Created an AWS serverless gateway utilizing Node.js Lambdas as a proxy to handle service hits, implement caching, and track performance metrics as a DevOps engineer.',
      tech: ['Node.js', 'AWS', 'Serverless', 'Postman'],
      metrics: [
        { label: 'Compute Overhead', value: '-30% Cost' },
        { label: 'API Response', value: '<150ms' },
        { label: 'Uptime SLA', value: '99.99%' },
      ],
      liveUrl: 'https://github.com',
    },
    {
      id: 'ai-vision-shirts',
      title: 'Custom Shirt Computer Vision App',
      category: 'AI & Machine Learning',
      desc: 'Computer Vision web application trained to detect, analyze, and classify shirt types and styling attributes.',
      longDesc: 'A custom retail-oriented computer vision tool powered by Google Cloud Vision API and Vertex AI model endpoints.',
      problem: 'Dynamic tagging and inventory sorting of uploaded clothing items was slow and required manual input.',
      solution: 'Designed a Python web application that takes an uploaded image, runs inference against a custom-trained Google Cloud Vision and Vertex model, and parses details regarding shirts.',
      tech: ['Python', 'GCP', 'TensorFlow', 'Computer Vision'],
      metrics: [
        { label: 'Vision Accuracy', value: '94.2%' },
        { label: 'Sorting Speed', value: 'Instant' },
        { label: 'Tag Automation', value: '100%' },
      ],
      liveUrl: 'https://github.com',
    },
    {
      id: 'django-audit-logs',
      title: 'Django Audited Todo Application',
      category: 'Full-Stack Development',
      desc: 'A robust state-tracking TODO application implementing comprehensive CRUD operation auditing.',
      longDesc: 'Implemented deep database-level audit logging capturing full user edit actions across all CRUD stages.',
      problem: 'Required absolute accountability and audit histories for team task management without database latency.',
      solution: 'Built a React.js single-page application communicating with a Django REST API. Implemented full audit tracing on PostgreSQL for all CRUD actions.',
      tech: ['React', 'Python', 'Django', 'psql'],
      metrics: [
        { label: 'Audit Logging Latency', value: '<10ms' },
        { label: 'DB Integrity', value: 'Postgres' },
        { label: 'CRUD Security', value: 'Role-Based' },
      ],
      liveUrl: 'https://github.com',
    },
    {
      id: 'receipt-parser',
      title: 'Google Vertex AI Receipt Parser',
      category: 'AI & Cloud Integration',
      desc: 'A smart expense receipt data scraper and organization app storing parsed fields in Firebase.',
      longDesc: 'An automation pipeline that scrapes details from invoice/receipt images and structures it.',
      problem: 'Manually uploading, reading, and filing business expense receipts was highly error-prone.',
      solution: 'Built a Vertex AI & Google Vision API scraper that parses text fields from images, structures metadata, and automatically logs invoice profiles in Firebase Firestore.',
      tech: ['React', 'GCP', 'Firebase', 'Postman'],
      metrics: [
        { label: 'Field Accuracy', value: '98%' },
        { label: 'Manual Entry Red.', value: '95%' },
        { label: 'Storage Sync', value: 'Firestore' },
      ],
      liveUrl: 'https://github.com',
    },
  ];

  // Filter projects by selected tag
  const filteredProjects = selectedTag
    ? projects.filter((p) => p.tech.includes(selectedTag))
    : projects;

  return (
    <section className="projects-section" id="projects">
      <div className="container">
        <h2 className="section-title">Featured Projects</h2>
        <p className="section-subtitle">
          A selection of cloud, full-stack, and AI systems built for real-world enterprise efficiency and scaling.
        </p>

        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            No projects found matching the tag "{selectedTag}". Try selecting another tag above!
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <div key={project.id} className="glass-card project-card">
                {/* Header Image Placeholder */}
                <div className="project-image-placeholder">
                  {project.id === 'kyc-bmo' && <Shield size={40} />}
                  {project.id === 'aws-migration' && <Database size={40} />}
                  {project.id === 'ai-vision-shirts' && <Cpu size={40} />}
                  {project.id === 'django-audit-logs' && <Database size={40} />}
                  {project.id === 'receipt-parser' && <Cpu size={40} />}
                </div>

                <div className="project-body">
                  <div className="project-tags">
                    <span className="project-tag">{project.category}</span>
                  </div>
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-desc">{project.desc}</p>
                  
                  {/* Highlight metrics */}
                  <div className="project-metrics">
                    {project.metrics.slice(0, 2).map((m, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="metric-val">{m.value}</span>
                        <span className="metric-label">{m.label}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: 'auto', display: 'flex', justifyContent: 'center' }}
                  >
                    <span>View Case Study</span>
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
}
