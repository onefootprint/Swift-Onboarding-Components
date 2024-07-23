export type RawSOSFiling = {
  state: string | null;
  registrationDate: string | null;
  registeredAgent: string | null;
  officers: FilingOfficer[];
  addresses: string[] | null;
  entityType: string | null;
  status: string | null;
  subStatus: string | null;
  source: string | null;
  name: string | null;
  jurisdiction: string | null;
  fileNumber: string | null;
};

export type SOSFiling = {
  id: string; // Internally used for filtering on the frontend
  state: string;
  registrationDate: string;
  registeredAgent: string;
  officers: FilingOfficer[];
  addresses: string[];
  entityType: string;
  status: FilingStatus | null;
  subStatus: string;
  source: string;
  name: string;
  jurisdiction: string;
  fileNumber: string;
};

export type FilingOfficer = {
  name: string | null;
  roles: string | null;
};

export enum FilingStatus {
  unknown = 'unknown',
  active = 'active',
  inactive = 'inactive',
}
