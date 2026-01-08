
import React from 'react';
import { ClassInfo, Subject } from '../types';
import { Calculator, Atom, Globe2, BookOpen, Music, Code } from 'lucide-react';

interface SubjectDashboardProps {
  classInfo: ClassInfo;
  onSelectSubject: (sub: Subject) => void;
}

const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Mathematics', icon: 'Calculator', color: 'blue' },
  { id: 'science', name: 'Science', icon: 'Atom', color: 'green' },
  { id: 'social', name: 'Social Science', icon: 'Globe2', color: 'red' },
  { id: 'english', name: 'English', icon: 'BookOpen', color: 'purple' },
  { id: 'arts', name: 'Fine Arts', icon: 'Music', color: 'pink' },
  { id: 'cs', name: 'Computer Science', icon: 'Code', color: 'teal' },
];

const ICON_MAP: Record<string, any> = {
  Calculator, Atom, Globe2, BookOpen, Music, Code
};

const SubjectDashboard: React.FC<SubjectDashboardProps> = ({ classInfo, onSelectSubject }) => {
  return (
    <div className="container mx-auto px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Curriculum Explorer</h2>
            <p className="text-gray-500">Class {classInfo.label} • All Core Disciplines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBJECTS.map((sub) => {
            const Icon = ICON_MAP[sub.icon];
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubject(sub)}
                className="group relative h-48 rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between overflow-hidden hover:border-white/20 transition-all duration-300 text-left"
              >
                <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/10 group-hover:scale-150 transition-all duration-700">
                  <Icon size={120} />
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${sub.color}-500/20 text-${sub.color}-400 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{sub.name}</h3>
                  <p className="text-gray-500 text-sm">Advanced Modules & Concepts</p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                   <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                     Explore <span className="text-white">→</span>
                   </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubjectDashboard;
