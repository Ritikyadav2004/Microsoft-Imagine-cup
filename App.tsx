
import React, { useState } from 'react';
import { View, ClassInfo, Subject, Topic } from './types';
import Dashboard from './components/Dashboard';
import SubjectDashboard from './components/SubjectDashboard';
import TopicDashboard from './components/TopicDashboard';
import RutherfordSimulation from './components/RutherfordSimulation';
import { ChevronLeft } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Dashboard);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const handleClassSelect = (cls: ClassInfo) => {
    setSelectedClass(cls);
    setView(View.SubjectDashboard);
  };

  const handleSubjectSelect = (sub: Subject) => {
    setSelectedSubject(sub);
    setView(View.TopicDashboard);
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setView(View.Simulation);
  };

  const goBack = () => {
    if (view === View.Simulation) setView(View.TopicDashboard);
    else if (view === View.TopicDashboard) setView(View.SubjectDashboard);
    else if (view === View.SubjectDashboard) setView(View.Dashboard);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          {view !== View.Dashboard && (
            <button 
              onClick={goBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
            EDUSPHERE
          </h1>
        </div>
        <div className="text-sm text-gray-400 font-medium">
          {view === View.Dashboard && "Select your grade"}
          {view === View.SubjectDashboard && `Class ${selectedClass?.label}`}
          {view === View.TopicDashboard && `${selectedSubject?.name} • Class ${selectedClass?.label}`}
          {view === View.Simulation && `${selectedTopic?.name}`}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        {view === View.Dashboard && (
          <Dashboard onSelectClass={handleClassSelect} />
        )}
        {view === View.SubjectDashboard && selectedClass && (
          <SubjectDashboard 
            classInfo={selectedClass} 
            onSelectSubject={handleSubjectSelect} 
          />
        )}
        {view === View.TopicDashboard && selectedSubject && (
          <TopicDashboard 
            subject={selectedSubject} 
            onSelectTopic={handleTopicSelect} 
          />
        )}
        {view === View.Simulation && selectedTopic && (
          <RutherfordSimulation topic={selectedTopic} />
        )}
      </main>
    </div>
  );
};

export default App;
