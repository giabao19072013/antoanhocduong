export interface Report {
  id?: string;
  content: string;
  location?: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface SafetyMessage {
  id?: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
}

export interface LawEntry {
  id: string;
  title: string;
  content: string;
  category: string;
}
