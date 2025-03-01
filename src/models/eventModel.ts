export interface Event {
  app_id: string;
  event: string;
  url: string;
  referrer: string;
  device: string;
  ipAddress: string;
  timestamp: string;
  metadata: Record<string, any>;
}
