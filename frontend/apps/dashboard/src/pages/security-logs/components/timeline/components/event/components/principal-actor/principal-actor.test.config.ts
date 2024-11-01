import type { ActorApiKey, ActorFirmEmployee, ActorFootprint, ActorOrganization, ActorUser } from '@onefootprint/types';
import { ActorKind } from '@onefootprint/types';

export const principalWithNameFixture: ActorOrganization = {
  kind: ActorKind.organization,
  member: '123',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.doe@example.com',
};

export const principalWithoutNameFixture: ActorOrganization = {
  kind: ActorKind.organization,
  member: '456',
  email: 'jane.doe@example.com',
};

export const footprintActorFixture: ActorFootprint = {
  kind: ActorKind.footprint,
};

export const firmEmployeeActorFixture: ActorFirmEmployee = {
  kind: ActorKind.firmEmployee,
};

export const organizationActorFixture: ActorOrganization = {
  kind: ActorKind.organization,
  member: '123',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com',
};

export const apiKeyActorFixture: ActorApiKey = {
  kind: ActorKind.apiKey,
  id: '123',
  name: 'Test API Key',
};

export const userActorFixture: ActorUser = {
  kind: ActorKind.user,
  fpId: 'fp_123',
};

export const firstNameOnlyFixture = {
  ...organizationActorFixture,
  firstName: 'John',
  lastName: undefined,
};

export const noNameFixture = {
  ...organizationActorFixture,
  firstName: undefined,
  lastName: undefined,
};

export const lastNameOnlyFixture = {
  ...organizationActorFixture,
  firstName: undefined,
  lastName: 'Smith',
};
