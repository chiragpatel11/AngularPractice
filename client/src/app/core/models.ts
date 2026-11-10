export type UserProfile = {
  id: string;
  email: string;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = {
  title: string;
  notes: string | null;
  dueDate: string | null;
};
