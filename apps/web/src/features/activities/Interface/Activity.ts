export type ActivityStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'FINISHED';
export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  price?: number;
  capacity?: number;
  startDate?: string;
  status: ActivityStatus;
  createdAt: string;
  latitude?: number | null;
  longitude?: number | null;
}
