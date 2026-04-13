export type User = {
  id: number;
  email: string;
};

export type Family = {
  id: number;
  admin_id: number;
  name: string;
  members: User[];
};
