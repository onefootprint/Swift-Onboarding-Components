import identifyUser from './identify-user';
import { withIdentify, withIdentifyError } from './identify-user.test.config';

describe('identifyUser', () => {
  beforeEach(() => {
    withIdentifyError();
  });

  describe('when nothing is passed', () => {
    it('should throw an exception', async () => {
      await expect(() => identifyUser()).rejects.toThrow();
    });
  });

  describe('when only email is passed and user is found', () => {
    beforeEach(() => {
      withIdentify({ userFound: true, availableChallengeKinds: ['sms'] });
    });

    it('should return true', async () => {
      await expect(
        identifyUser({ 'id.email': 'jane.doe@acme.com' }),
      ).resolves.toEqual(true);
    });
  });

  describe('when email and phoneNumber are passed, and user is found with the phoneNumber', () => {
    it('should return true', async () => {
      withIdentify({ userFound: false, once: true });
      withIdentify({
        userFound: true,
        availableChallengeKinds: ['sms'],
        once: true,
      });

      await expect(
        identifyUser({
          'id.email': 'jane.doe@acme.com',
          'id.phone_number': '+1-202-555-0130',
        }),
      ).resolves.toEqual(true);
    });
  });

  describe('when only phoneNumber is passed and user is found', () => {
    beforeEach(() => {
      withIdentify({ userFound: true, availableChallengeKinds: ['sms'] });
    });

    it('should return true', async () => {
      await expect(
        identifyUser({ 'id.phone_number': '+1-202-555-0130' }),
      ).resolves.toEqual(true);
    });
  });

  describe('when only email is passed and user is not found', () => {
    beforeEach(() => {
      withIdentify({ userFound: false });
    });

    it('should return false', async () => {
      await expect(
        identifyUser({ 'id.email': 'jane.doe@acme.com' }),
      ).resolves.toEqual(false);
    });
  });

  describe('when email and phoneNumber are passed and user is not found', () => {
    beforeEach(() => {
      withIdentify({ userFound: false });
    });

    it('should return false', async () => {
      await expect(
        identifyUser({
          'id.email': 'jane.doe@acme.com',
          'id.phone_number': '+1-202-555-0130',
        }),
      ).resolves.toEqual(false);
    });
  });
});
