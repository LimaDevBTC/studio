export interface ConsultationStatus {
  userId: string;
  status: 'available' | 'scheduled' | 'completed';
  calendlyEventId?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  npsScore?: number;
  npsComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendlyEvent {
  uri: string;
  name: string;
  status: 'active' | 'canceled';
  start_time: string;
  end_time: string;
  event_type: string;
  invitee: {
    email: string;
    name: string;
    uri: string;
  };
}
