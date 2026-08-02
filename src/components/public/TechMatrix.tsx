'use client';

import { 
  Code2, 
  Cloud, 
  Brain, 
  Smartphone, 
  Layers,
  Database,
  GitBranch
} from 'lucide-react';

interface TechMatrixProps {
  selectedTag: string;
  onTagSelect: (tag: string) => void;
}

export default function TechMatrix({ selectedTag, onTagSelect }: TechMatrixProps) {
  const categories = [
    {
      id: 'fullstack',
      title: 'Full-Stack',
      icon: <Code2 size={24} />,
      desc: 'Angular, React, Node.js, Django',
      skills: ['React', 'Angular', 'Node.js', 'Python', 'Django'],
    },
    {
      id: 'cloud',
      title: 'Cloud Architecture',
      icon: <Cloud size={24} />,
      desc: 'AWS Lambda, GCP, Azure migrations',
      skills: ['AWS', 'GCP', 'Azure', 'Serverless'],
    },
    {
      id: 'ai',
      title: 'AI & ML',
      icon: <Brain size={24} />,
      desc: 'Computer Vision, TensorFlow, PyTorch',
      skills: ['TensorFlow', 'PyTorch', 'Computer Vision', 'Python'],
    },
    {
      id: 'mobile',
      title: 'Mobile Dev',
      icon: <Smartphone size={24} />,
      desc: 'Cross-platform apps (Flutter/React Native)',
      skills: ['Flutter', 'React-Native'],
    },
  ];

  const allSkills = [
    'React', 'Angular', 'Node.js', 'Python', 'Django',
    'AWS', 'GCP', 'Azure', 'TensorFlow', 'PyTorch',
    'Flutter', 'React-Native', 'Postman', 'psql'
  ];

  return (
    <section className="expertise-section" id="expertise">
      <div className="ambient-glow glow-purple" style={{ top: '20%', left: '70%' }} />
      
      <div className="container">
        <h2 className="section-title">Technical Expertise</h2>
        <p className="section-subtitle">
          Demonstrated competencies across modern cloud ecosystems, machine learning models, and full-stack frameworks. Click a tag to filter my featured projects.
        </p>

        <div className="grid-4" style={{ marginBottom: '50px' }}>
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="glass-card tech-card-item"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
              onClick={() => {
                // Select the first skill from that category as a filter
                onTagSelect(cat.skills[0]);
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--accent-purple)' }}>
                <div style={{ margin: 'auto' }}>{cat.icon}</div>
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>{cat.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Interactive Technology Stack Matrix
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            <button
              className={`btn ${selectedTag === '' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onTagSelect('')}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              All Tech
            </button>
            {allSkills.map((skill) => (
              <button
                key={skill}
                className={`btn ${selectedTag === skill ? 'btn-cyan' : 'btn-secondary'}`}
                onClick={() => onTagSelect(skill)}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
