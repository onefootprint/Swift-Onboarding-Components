export type RawBusinessPerson = {
  name: string | null;
  role: string | null;
  submitted: boolean | null;
  associationVerified: boolean | null;
  sources: string | null;
};

export type BusinessPerson = {
  name: string;
  role: string;
  submitted: boolean;
  associationVerified: boolean;
  sources: string | null;
};
