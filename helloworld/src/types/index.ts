export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  isStaff: boolean;
  createdAt: string;
  lastLogin: string;
  points: number;
  role: string;
  progress: UserProgress[];
}

export interface UserProgress {
  testId: string;
  score: number;
  completedAt: string;
}

export interface NotificationType {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}
