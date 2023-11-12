import fetchMock from 'jest-fetch-mock';

import identifyUser from './identify-user';

describe('identifyUser', () => {
  beforeAll(() => {
    fetchMock.enableMocks();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('when nothing is passed', () => {
    it('should throw an exception', async () => {
      await expect(() => identifyUser()).rejects.toThrow();
    });
  });

  describe('when only email is passed and user is found', () => {
    beforeEach(() => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          available_challenge_kinds: ['sms'],
          user_found: true,
        }),
      );
    });

    it('should return true', async () => {
      await expect(
        identifyUser({ 'id.email': 'jane.doe@acme.com' }),
      ).resolves.toEqual(true);
    });
  });

  describe('when only phoneNumber is passed and user is found', () => {
    beforeEach(() => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          available_challenge_kinds: ['sms'],
          user_found: true,
        }),
      );
    });

    it('should return true', async () => {
      await expect(
        identifyUser({ 'id.phone_number': '+1-202-555-0130' }),
      ).resolves.toEqual(true);
    });
  });

  describe('when email and phoneNumber are passed, and user is found with the phoneNumber', () => {
    beforeEach(() => {
      fetchMock.mockResponseOnce(
        JSON.stringify({ available_challenge_kinds: null, user_found: false }),
      );
      fetchMock.mockResponseOnce(
        JSON.stringify({
          available_challenge_kinds: ['sms'],
          user_found: true,
        }),
      );
    });

    it('should return true', async () => {
      await expect(
        identifyUser({
          'id.email': 'jane.doe@acme.com',
          'id.phone_number': '+1-202-555-0130',
        }),
      ).resolves.toEqual(true);
    });
  });

  describe('when only email is passed and user is not found', () => {
    beforeEach(() => {
      fetchMock.mockResponseOnce(
        JSON.stringify({ available_challenge_kinds: null, user_found: false }),
      );
    });

    it('should return false', async () => {
      await expect(
        identifyUser({ 'id.email': 'jane.doe@acme.com' }),
      ).resolves.toEqual(false);
    });
  });

  describe('when email and phoneNumber are passed and user is not found', () => {
    beforeEach(() => {
      fetchMock.mockResponseOnce(
        JSON.stringify({ available_challenge_kinds: null, user_found: false }),
      );
      fetchMock.mockResponseOnce(
        JSON.stringify({ available_challenge_kinds: null, user_found: false }),
      );
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
