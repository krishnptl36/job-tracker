

export interface JobApplication {
  _id: string;
  title?: string;
  company: string;
  position?: string;
  location?: string;
  status?: string;
  notes?: string;
  salary?: string;
  url?: string;
  jobUrl?: string;
  order?: number;
  columnId?: string;
  boardId?: string;
  userId?: string;
  tags?: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Column {
  _id: string;
  name: string;
  order: number;
  boardId?: string;
  jobApplications?: JobApplication[];
  jobApplicationId?: JobApplication[];
}

export interface Board {
  _id: string;
  name: string;
  userId?: string;
  columns: Column[];
  createdAt?: string;
  updatedAt?: string;
}