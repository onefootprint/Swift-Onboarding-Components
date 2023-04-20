export type ApiKey = {
  createdAt: string;
  id: string;
  isLive: boolean;
  key: string | null;
  lastUsedAt: string | null;
  name: string;
  status: 'enabled' | 'disabled';
};
