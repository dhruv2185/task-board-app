export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  priority: Priority;
  dueDate: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
}