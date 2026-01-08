
import React from 'react';
import { Subject, Topic } from '../types';
import { FlaskConical, Beaker, Zap, Microchip } from 'lucide-react';

interface TopicDashboardProps {
  subject: Subject;
  onSelectTopic: (topic: Topic) => void;
}

const TOPICS: Record<string, Topic[]> = {
  science: [
    { id: 'rutherford', name: "Rutherford's Atomic Model", description: 'The Alpha Particle Scattering Experiment that changed physics.' },
    { id: 'chemical_rxns', name: "Chemical Reactions", description: 'Balancing equations and types of reactions.' },
    { id: 'periodic_table', name: "Periodic Classification", description: 'Evolution and modern periodic trends.' },
    { id: 'life_processes', name: "Life Processes", description: 'Fundamentals of nutrition, respiration, and transport.' },
  ],
  math: [
    { id: 'trig', name: "Trigonometry", description: 'Ratios, identities, and heights & distances.' },
    { id: 'quadratics', name: "Quadratic Equations", description: 'Nature of roots and application problems.' },
  ]
};

const TopicDashboard: React.FC<TopicDashboardProps> = ({ subject, onSelectTopic }) => {
  const topics = TOPICS[subject.id] || [];

  return (
    <div className="container mx-auto px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">{subject.name} Modules</h2>
          <div className="h-1 w-24 bg-yellow-500 rounded-full" />
        </div>

        <div className="space-y-4">
          {topics.length > 0 ? topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className="w-full group bg-white/5 border border-white/10 hover:bg-white/10 p-6 rounded-2xl flex items-center justify-between transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                  <FlaskConical size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{topic.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-1">{topic.description}</p>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                <span className="text-sm font-bold text-yellow-500">Launch Simulation</span>
              </div>
            </button>
          )) : (
            <div className="py-20 text-center text-gray-600">
              No modules available for this subject yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicDashboard;
