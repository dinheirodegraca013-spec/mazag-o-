
export type AiJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'dead_letter';

export interface AiJob {
  id: string;
  type: string;
  payload: any;
  status: AiJobStatus;
  attempts: number;
  max_attempts: number;
  priority: number;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
  dead_letter_at?: string;
  last_error?: string;
}

export interface AiOutput {
  id: string;
  job_id: string;
  output: any;
  output_hash: string;
  prompt_hash: string;
  context_hash: string;
  output_version: number;
  created_at: string;
}

export interface DomainEvent {
  id: string;
  event_type: string;
  payload: any;
  tenant_id?: string;
  created_at: string;
}

export interface TrackingEvent {
  id: string;
  event_type: string;
  metadata: any;
  created_at: string;
}
