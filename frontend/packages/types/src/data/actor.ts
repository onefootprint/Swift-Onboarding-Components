export enum ActorKind {
  footprint = 'footprint',
  firmEmployee = 'firm_employee',
  organization = 'organization',
  apiKey = 'api_key',
}

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
  name: string;
};
