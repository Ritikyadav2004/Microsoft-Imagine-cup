
import React from 'react';
import { ClassInfo } from '../types';

interface DashboardProps {
  onSelectClass: (cls: ClassInfo) => void;
}

const CLASSES: ClassInfo[] = [
  { id: 5, label: '5' },
  { id: 6, label: '6' },
  { id: 7, label: '7' },
  { id: 8, label: '8' },
  { id: 9, label: '9' },
  { id: 10, label: '10' },
  { id: 11, label: '11' },
  { id: 12, label: '12' },
];

const Dashboard: React.FC<DashboardProps> = ({ onSelectClass }) => {
  return (
    <div className="container mx-auto px-6 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-4 text-center bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          Welcome to the Future of Learning
        </h2>
        <p className="text-gray-500 text-center mb-12 text-lg">
          Pick your grade to explore immersive educational content.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CLASSES.map((cls) => (
            <button
              key={cls.id}
              onClick={() => onSelectClass(cls)}
              className="group relative overflow-hidden h-40 rounded-2xl bg-white/5 border border-white/10 hover:border-yellow-500/50 transition-all duration-300 flex flex-col items-center justify-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Class</span>
              <span className="text-5xl font-black group-hover:scale-110 transition-transform">{cls.label}</span>
              <div className="w-12 h-1 bg-yellow-500/20 group-hover:w-20 group-hover:bg-yellow-500 transition-all duration-300 rounded-full" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
