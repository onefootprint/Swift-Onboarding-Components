import fixtures from './__fixtures__';
import getAddressComponents from './get-address-components';
import { withGoogleMaps, withGoogleMapsError } from './get-address-components.test.config';

describe('getAddressComponents', () => {
  describe('when it returns the response with success', () => {
    describe('when it has a valid input', () => {
      beforeEach(() => {
        withGoogleMaps('success', fixtures.result);
      });

      it('should return the city', async () => {
        const result = await getAddressComponents(fixtures.prediction);
        expect(result?.city).toBe('San Francisco');
      });

      it('should return the state', async () => {
        const result = await getAddressComponents(fixtures.prediction);
        expect(result?.state).toBe('California');
      });

      it('should return the zip', async () => {
        const result = await getAddressComponents(fixtures.prediction);
        expect(result?.zip).toBe('94110');
      });
    });

    describe('when it has an invalid input', () => {
      beforeEach(() => {
        withGoogleMaps('success', null);
      });

      it('should return nothing', async () => {
        const result = await getAddressComponents(fixtures.prediction);
        expect(result).toBeNull();
      });
    });
  });

  describe('when it returns the response with error', () => {
    beforeEach(() => {
      withGoogleMapsError();
    });

    it('should return nothing', async () => {
      const result = await getAddressComponents(fixtures.prediction);
      expect(result).toBeNull();
    });
  });
});
