import type { ActorApiKey, ActorFirmEmployee, ActorFootprint, ActorOrganization, ActorUser } from '@onefootprint/types';
import { ActorKind } from '@onefootprint/types';

import getActorText from './get-actor-text';

describe('getActorText', () => {
  describe('when the actor passed in is not recognized', () => {
    it('should return an empty string', () => {
      const noActorText = getActorText();
      expect(noActorText).toEqual('');

      const undefinedActorText = getActorText(undefined);
      expect(undefinedActorText).toEqual('');
    });
  });

  describe('when a ActorKind.user is passed in', () => {
    it('should return their fpId', () => {
      const user = {
        kind: ActorKind.user,
        fpId: '1',
      } as ActorUser;
      const actorText = getActorText(user);
      expect(actorText).toEqual('1');
    });
  });

  describe('when a ActorKind.footprint is passed in', () => {
    it("should return 'Footprint'", () => {
      const footprint = {
        kind: ActorKind.footprint,
        fpId: '2',
      } as ActorFootprint;
      const actorText = getActorText(footprint);
      expect(actorText).toEqual('Footprint');
    });
  });

  describe('when a ActorKind.firmEmployee is passed in', () => {
    it("should return 'Footprint Risk Ops'", () => {
      const employee = {
        kind: ActorKind.firmEmployee,
        fpId: '3',
      } as ActorFirmEmployee;
      const actorText = getActorText(employee);
      expect(actorText).toEqual('Footprint Risk Ops');
    });
  });

  describe('when a ActorKind.organization is passed in', () => {
    it('should return its member', () => {
      const org = {
        kind: ActorKind.organization,
        member: 'member',
      } as ActorOrganization;
      const actorText = getActorText(org);
      expect(actorText).toEqual('member');
    });
  });

  describe('when a ActorKind.apiKey is passed in', () => {
    it('should return its name', () => {
      const apiKey = {
        kind: ActorKind.apiKey,
        id: '5',
        name: 'api_key_name',
      } as ActorApiKey;
      const actorText = getActorText(apiKey);
      expect(actorText).toEqual('api_key_name');
    });
  });
});
