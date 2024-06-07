export enum ActorKind {
  user = 'user',
  footprint = 'footprint',
  firmEmployee = 'firm_employee',
  organization = 'organization',
  apiKey = 'api_key',
}

export type ActorUser = {
  kind: ActorKind.user;
  fpId: string;
};

export type ActorFootprint = {
  kind: ActorKind.footprint;
};

export type ActorFirmEmployee = {
  kind: ActorKind.firmEmployee;
};

export type ActorOrganization = {
  kind: ActorKind.organization;
  member: string;
};

export type ActorApiKey = {
  kind: ActorKind.apiKey;
  id: string;
  name: string;
};

export type Actor = ActorUser | ActorFootprint | ActorFirmEmployee | ActorOrganization | ActorApiKey;
