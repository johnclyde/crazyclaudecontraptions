export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  progress: UserProgress[];
}

export interface UserProgress {
  testId: string;
  score: number;
  completedAt: string;
}
