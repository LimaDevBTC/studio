export interface LiveSession {
  id: string;
  title: string;
  description: string;
  externalUrl: string;
  service: 'meet' | 'zoom' | 'youtube' | 'other';
  status: 'scheduled' | 'live' | 'finished';
  scheduledAt: Date | any; // Firestore Timestamp
  startedAt?: Date | any; // Firestore Timestamp
  finishedAt?: Date | any; // Firestore Timestamp
  adminId: string;
  isPrivate: boolean;
  allowedUsers?: string[];
  consultationType: 'public' | 'private'; // Novo campo
  maxParticipants?: number; // Para consultorias em grupo
  createdAt: Date | any; // Firestore Timestamp
  updatedAt: Date | any; // Firestore Timestamp
}

export type LiveService = 'meet' | 'zoom' | 'youtube' | 'other';
export type LiveStatus = 'scheduled' | 'live' | 'finished';
