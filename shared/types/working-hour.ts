export interface WorkingHour {
  id: number;
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
  breakInHours: number;
  plusOneDay: boolean;
  activity: string;
  createdAt: string;
  updatedAt: string;
}
