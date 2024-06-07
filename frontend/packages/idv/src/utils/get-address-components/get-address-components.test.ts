import fixtures from './__fixtures__';
import getAddressComponents, { getAddressParts, getAutoCompleteCity } from './get-address-components';
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
  UsaAddressFixture4,
  UsaAddressFixture5,
  UsaAddressFixture6,
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
        const result = await getAddressComponents(fixtures.prediction, 'US');
        expect(result?.city).toBe('San Francisco');
      });

      it('should return the state', async () => {
        const result = await getAddressComponents(fixtures.prediction, 'US');
        expect(result?.state).toBe('California');
      });

      it('should return the zip', async () => {
        const result = await getAddressComponents(fixtures.prediction, 'US');
        expect(result?.zip).toBe('94110');
      });
    });

    describe('when it has an invalid input', () => {
      beforeEach(() => {
        withGoogleMaps('success', null);
      });

      it('should return nothing', async () => {
        const result = await getAddressComponents(fixtures.prediction, 'US');
        expect(result).toBeNull();
      });
    });
  });

  describe('when it returns the response with error', () => {
    beforeEach(() => {
      withGoogleMapsError();
    });

    it('should return nothing', async () => {
      const result = await getAddressComponents(fixtures.prediction, 'US');
      expect(result).toBeNull();
    });
  });

  describe('when extracting address parts from address components', () => {
    it('can extract USA addresses correctly', () => {
      expect(
        getAddressParts(
          UsaAddressFixture1.mainText,
          UsaAddressFixture1.addressComponents,
          UsaAddressFixture1.secondaryText,
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
          UsaAddressFixture2.secondaryText,
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
          UsaAddressFixture3.secondaryText,
        ),
      ).toEqual({
        addressLine1: '345 Harrison Avenue',
        addressLine2: undefined,
        city: 'Boston',
        state: 'Massachusetts',
        zip: '02118',
      });

      expect(
        getAddressParts(
          UsaAddressFixture5.mainText,
          UsaAddressFixture5.addressComponents,
          UsaAddressFixture5.secondaryText,
        ),
      ).toEqual({
        addressLine1: '10344 104th Street',
        addressLine2: undefined,
        city: 'Ozone Park',
        state: 'New York',
        zip: '11417',
      });

      expect(
        getAddressParts(
          UsaAddressFixture6.mainText,
          UsaAddressFixture6.addressComponents,
          UsaAddressFixture6.secondaryText,
        ),
      ).toEqual({
        addressLine1: '10344 104th Street',
        addressLine2: undefined,
        city: 'Jamaica',
        state: 'New York',
        zip: '11417',
      });
    });

    it('can extract Mexican addresses correctly', () => {
      expect(
        getAddressParts(
          MexicoAddressFixture1.mainText,
          MexicoAddressFixture1.addressComponents,
          MexicoAddressFixture1.secondaryText,
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
          MexicoAddressFixture2.secondaryText,
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
          MexicoAddressFixture3.secondaryText,
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
          TurkeyAddressFixture1.secondaryText,
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
          CanadaAddressFixture1.secondaryText,
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
          ChinaAddressFixture1.secondaryText,
        ),
      ).toEqual({
        addressLine1: 'Yunjian Greenland Villa, Jin Xiu Dong Lu',
        addressLine2: undefined,
        city: 'Pu Dong Xin Qu',
        state: 'Shang Hai Shi',
        zip: '200135',
      });
    });

    it('can extract Hong Kong addresses correctly', () => {
      expect(
        getAddressParts(
          HongKongAddressFixture1.mainText,
          HongKongAddressFixture1.addressComponents,
          HongKongAddressFixture1.secondaryText,
        ),
      ).toEqual({
        addressLine1: '33 Hip Wo Street',
        addressLine2: undefined,
        city: 'Kwun Tong',
        state: undefined,
        zip: undefined,
      });

      expect(
        getAddressParts(
          HongKongAddressFixture2.mainText,
          HongKongAddressFixture2.addressComponents,
          HongKongAddressFixture2.secondaryText,
        ),
      ).toEqual({
        addressLine1: 'Li Po Chun United World College, Sai Sha Road',
        addressLine2: undefined,
        city: 'Ma On Shan',
        state: undefined,
        zip: undefined,
      });
    });

    it('can extract Brazilian addresses correctly', () => {
      expect(
        getAddressParts(
          BrazilAddressFixture1.mainText,
          BrazilAddressFixture1.addressComponents,
          BrazilAddressFixture1.secondaryText,
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
          BrazilAddressFixture2.secondaryText,
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
          ArgentinaAddressFixture1.secondaryText,
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
          ArgentinaAddressFixture2.secondaryText,
        ),
      ).toEqual({
        addressLine1: 'Centenario 133',
        addressLine2: 'Caballito',
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        zip: 'C1405',
      });
    });

    it('can extract Brooklyn address correctly', () => {
      expect(
        getAddressParts(
          UsaAddressFixture4.mainText,
          UsaAddressFixture4.addressComponents,
          UsaAddressFixture4.secondaryText,
        ),
      ).toEqual({
        addressLine1: '373 Wythe Avenue',
        addressLine2: undefined,
        city: 'Brooklyn',
        state: 'New York',
        zip: '11249',
      });
    });
  });
});

describe('getAutoCompleteCity', () => {
  it.each([
    { obj: ArgentinaAddressFixture1, x: 'Buenos Aires' },
    { obj: ArgentinaAddressFixture2, x: 'Buenos Aires' },
    { obj: BrazilAddressFixture1, x: 'Florianópolis' },
    { obj: BrazilAddressFixture2, x: 'Brasília' },
    { obj: CanadaAddressFixture1, x: 'Edmonton' },
    { obj: ChinaAddressFixture1, x: 'Pu Dong Xin Qu' },
    { obj: HongKongAddressFixture1, x: 'Kwun Tong' },
    { obj: HongKongAddressFixture2, x: 'Ma On Shan' },
    { obj: MexicoAddressFixture1, x: 'Mismaloya' },
    { obj: MexicoAddressFixture2, x: 'Ciudad de México' },
    { obj: MexicoAddressFixture3, x: 'La Paz' },
    { obj: TurkeyAddressFixture1, x: 'Odunpazarı' },
    { obj: UsaAddressFixture1, x: 'Huntington Beach' },
    { obj: UsaAddressFixture2, x: 'San Francisco' },
    { obj: UsaAddressFixture3, x: 'Boston' },
    { obj: UsaAddressFixture4, x: 'Brooklyn' },
    { obj: UsaAddressFixture5, x: 'Ozone Park' },
    { obj: UsaAddressFixture6, x: 'Jamaica' },
  ])('case %#', ({ obj, x }) => {
    const { addressComponents } = obj;
    const { secondaryText } = obj;
    expect(getAutoCompleteCity(addressComponents, secondaryText)).toEqual(x);
  });
});
