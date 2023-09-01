import fixtures from './__fixtures__';
import getAddressComponents, {
  getAddressParts,
} from './get-address-components';
import {
  ArgentinaAddressFixture1,
  ArgentinaAddressFixture2,
  BrazilAddressFixture1,
  BrazilAddressFixture2,
  CanadaAddressFixture1,
  ChinaAddressFixture1,
  HongKongAddressFixture1,
  HongKongAddressFixture2,
  MexicoAddressFixture1,
  MexicoAddressFixture2,
  MexicoAddressFixture3,
  TurkeyAddressFixture1,
  UsaAddressFixture1,
  UsaAddressFixture2,
  UsaAddressFixture3,
  withGoogleMaps,
  withGoogleMapsError,
} from './get-address-components.test.config';

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

  describe('when extracting address parts from address components', () => {
    it('can extract USA addresses correctly', () => {
      expect(
        getAddressParts(
          UsaAddressFixture1.mainText,
          UsaAddressFixture1.addressComponents,
        ),
      ).toEqual({
        addressLine1: '21030 Pacific City Circle',
        addressLine2: undefined,
        city: 'Huntington Beach',
        state: 'California',
        zip: '92648',
      });

      expect(
        getAddressParts(
          UsaAddressFixture2.mainText,
          UsaAddressFixture2.addressComponents,
        ),
      ).toEqual({
        addressLine1: '413 Mississippi Street',
        addressLine2: undefined,
        city: 'San Francisco',
        state: 'California',
        zip: '94107',
      });

      expect(
        getAddressParts(
          UsaAddressFixture3.mainText,
          UsaAddressFixture3.addressComponents,
        ),
      ).toEqual({
        addressLine1: '345 Harrison Avenue',
        addressLine2: undefined,
        city: 'Boston',
        state: 'Massachusetts',
        zip: '02118',
      });
    });

    it('can extract Mexican addresses correctly', () => {
      expect(
        getAddressParts(
          MexicoAddressFixture1.mainText,
          MexicoAddressFixture1.addressComponents,
        ),
      ).toEqual({
        addressLine1: 'VILLA PATRICIA',
        addressLine2: undefined,
        city: 'Mismaloya',
        state: 'Jalisco',
        zip: '48270',
      });

      expect(
        getAddressParts(
          MexicoAddressFixture2.mainText,
          MexicoAddressFixture2.addressComponents,
        ),
      ).toEqual({
        addressLine1: '16 de Septiembre 79',
        addressLine2: 'Centro Histórico de la Ciudad de México',
        city: 'Ciudad de México',
        state: 'Ciudad de México',
        zip: '06000',
      });

      expect(
        getAddressParts(
          MexicoAddressFixture3.mainText,
          MexicoAddressFixture3.addressComponents,
        ),
      ).toEqual({
        addressLine1: 'C. Cuauhtémoc 835, Calle Cuauhtémoc',
        addressLine2: 'Pueblo Nuevo',
        city: 'La Paz',
        state: 'Baja California Sur',
        zip: '23060',
      });
    });

    it('can extract Turkish addresses correctly', () => {
      expect(
        getAddressParts(
          TurkeyAddressFixture1.mainText,
          TurkeyAddressFixture1.addressComponents,
        ),
      ).toEqual({
        addressLine1: 'Hisar Park Konutları, Küme Sokak',
        addressLine2: undefined,
        city: 'Odunpazarı',
        state: 'Eskişehir',
        zip: '26160',
      });
    });

    it('can extract Canadian addresses correctly', () => {
      expect(
        getAddressParts(
          CanadaAddressFixture1.mainText,
          CanadaAddressFixture1.addressComponents,
        ),
      ).toEqual({
        addressLine1: '72 Ave NW, 72 Avenue Northwest',
        addressLine2: 'Southwest Edmonton',
        city: 'Edmonton',
        state: 'Alberta',
        zip: 'T6E 1A3',
      });
    });

    it('can extract Chinese addresses correctly', () => {
      expect(
        getAddressParts(
          ChinaAddressFixture1.mainText,
          ChinaAddressFixture1.addressComponents,
        ),
      ).toEqual({
        addressLine1: 'Yunjian Greenland Villa, Jin Xiu Dong Lu',
        addressLine2: 'Pu Dong Xin Qu',
        city: undefined,
        state: 'Shang Hai Shi',
        zip: '200135',
      });
    });

    it('can extract Hong Kong addresses correctly', () => {
      expect(
        getAddressParts(
          HongKongAddressFixture1.mainText,
          HongKongAddressFixture1.addressComponents,
        ),
      ).toEqual({
        addressLine1: '33 Hip Wo Street',
        addressLine2: 'Kwun Tong',
        city: 'Kowloon',
        state: undefined,
        zip: undefined,
      });

      expect(
        getAddressParts(
          HongKongAddressFixture2.mainText,
          HongKongAddressFixture2.addressComponents,
        ),
      ).toEqual({
        addressLine1: 'Li Po Chun United World College, Sai Sha Road',
        addressLine2: 'Ma On Shan',
        city: 'New Territories',
        state: undefined,
        zip: undefined,
      });
    });

    it('can extract Brazilian addresses correctly', () => {
      expect(
        getAddressParts(
          BrazilAddressFixture1.mainText,
          BrazilAddressFixture1.addressComponents,
        ),
      ).toEqual({
        addressLine1: "Av. Júlio D'Acia Barreto, Avenida Júlio D'Acia Barreto",
        addressLine2: 'Carvoeira',
        city: 'Florianópolis',
        state: 'Santa Catarina',
        zip: '88040-520',
      });

      expect(
        getAddressParts(
          BrazilAddressFixture2.mainText,
          BrazilAddressFixture2.addressComponents,
        ),
      ).toEqual({
        addressLine1: 'SQNW 310, Bloco D - 310 Lotus',
        addressLine2: 'Noroeste',
        city: 'Brasília',
        state: 'Distrito Federal',
        zip: '70687-220',
      });
    });

    it('can extract Argentinian addresses correctly', () => {
      expect(
        getAddressParts(
          ArgentinaAddressFixture1.mainText,
          ArgentinaAddressFixture1.addressComponents,
        ),
      ).toEqual({
        addressLine1: 'Avenida Pedro Goyena',
        addressLine2: undefined,
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        zip: undefined,
      });

      expect(
        getAddressParts(
          ArgentinaAddressFixture2.mainText,
          ArgentinaAddressFixture2.addressComponents,
        ),
      ).toEqual({
        addressLine1: 'Centenario 133',
        addressLine2: 'Caballito',
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        zip: 'C1405',
      });
    });
  });
});
