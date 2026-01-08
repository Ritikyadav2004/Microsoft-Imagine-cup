
export enum View {
  Dashboard = 'DASHBOARD',
  SubjectDashboard = 'SUBJECT_DASHBOARD',
  TopicDashboard = 'TOPIC_DASHBOARD',
  Simulation = 'SIMULATION'
}

export interface ClassInfo {
  id: number;
  label: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export enum AtomModel {
  Thomson = 'THOMSON',
  Rutherford = 'RUTHERFORD'
}
