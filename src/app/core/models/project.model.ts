export interface Project {
  id: number;
  name: string;
  description: string | null;
  ownerUsername: string;
  createdAt: string;
}

export interface ProjectRequest {
  name: string;
  description?: string;
}
