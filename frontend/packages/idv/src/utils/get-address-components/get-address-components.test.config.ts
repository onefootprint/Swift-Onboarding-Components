export const withGoogleMaps = (type: string, data?: unknown) => {
  global.google = {
    maps: {
      places: {
        // @ts-ignore
        PlacesService: class {
          getDetails = (_: unknown, cb: (dataArg: unknown, status: string) => void) => {
            cb(type === 'success' ? data : null, type === 'success' ? 'OK' : 'ERROR');
          };
        },
      },
    },
  };
};

export const withGoogleMapsError = () => {
  withGoogleMaps('error');
};

export const UsaAddressFixture1 = {
  mainText: '21030 Pacific City Circle',
  secondaryText: 'Huntington Beach, CA, EUA',
  addressComponents: [
    {
      long_name: '21030',
      short_name: '21030',
      types: ['street_number'],
    },
    {
      long_name: 'Pacific City Circle',
      short_name: 'Pacific City Cir',
      types: ['route'],
    },
    {
      long_name: 'Huntington Beach',
      short_name: 'Huntington Beach',
      types: ['locality', 'political'],
    },
    {
      long_name: 'Orange County',
      short_name: 'Orange County',
      types: ['administrative_area_level_2', 'political'],
    },
    {
      long_name: 'California',
      short_name: 'CA',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'United States',
      short_name: 'US',
      types: ['country', 'political'],
    },
    {
      long_name: '92648',
      short_name: '92648',
      types: ['postal_code'],
    },
  ],
};

export const UsaAddressFixture2 = {
  mainText: '413 Mississippi Street',
  secondaryText: 'San Francisco, CA, EUA',
  addressComponents: [
    {
      long_name: '413',
      short_name: '413',
      types: ['street_number'],
    },
    {
      long_name: 'Mississippi Street',
      short_name: 'Mississippi St',
      types: ['route'],
    },
    {
      long_name: 'Potrero Hill',
      short_name: 'Potrero Hill',
      types: ['neighborhood', 'political'],
    },
    {
      long_name: 'San Francisco',
      short_name: 'SF',
      types: ['locality', 'political'],
    },
    {
      long_name: 'San Francisco County',
      short_name: 'San Francisco County',
      types: ['administrative_area_level_2', 'political'],
    },
    {
      long_name: 'California',
      short_name: 'CA',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'United States',
      short_name: 'US',
      types: ['country', 'political'],
    },
    {
      long_name: '94107',
      short_name: '94107',
      types: ['postal_code'],
    },
    {
      long_name: '2927',
      short_name: '2927',
      types: ['postal_code_suffix'],
    },
  ],
};

export const UsaAddressFixture3 = {
  mainText: '345 Harrison Avenue',
  secondaryText: 'Boston, MA, EUA',
  addressComponents: [
    {
      long_name: '345',
      short_name: '345',
      types: ['street_number'],
    },
    {
      long_name: 'Harrison Avenue',
      short_name: 'Harrison Ave',
      types: ['route'],
    },
    {
      long_name: 'South End',
      short_name: 'South End',
      types: ['neighborhood', 'political'],
    },
    {
      long_name: 'Boston',
      short_name: 'Boston',
      types: ['locality', 'political'],
    },
    {
      long_name: 'Suffolk County',
      short_name: 'Suffolk County',
      types: ['administrative_area_level_2', 'political'],
    },
    {
      long_name: 'Massachusetts',
      short_name: 'MA',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'United States',
      short_name: 'US',
      types: ['country', 'political'],
    },
    {
      long_name: '02118',
      short_name: '02118',
      types: ['postal_code'],
    },
    {
      long_name: '3054',
      short_name: '3054',
      types: ['postal_code_suffix'],
    },
  ],
};

export const UsaAddressFixture4 = {
  mainText: '373 Wythe Avenue',
  secondaryText: 'Brooklyn, NY, EUA',
  addressComponents: [
    { long_name: '11249', short_name: '11249', types: ['postal_code'] },
    { long_name: '373', short_name: '373', types: ['street_number'] },
    {
      long_name: 'Wythe Avenue',
      short_name: 'Wythe Ave',
      types: ['route'],
    },
    {
      long_name: 'Williamsburg',
      short_name: 'Williamsburg',
      types: ['neighborhood', 'political'],
    },
    {
      long_name: 'Brooklyn',
      short_name: 'Brooklyn',
      types: ['sublocality_level_1', 'sublocality', 'political'],
    },
    {
      long_name: 'Kings County',
      short_name: 'Kings County',
      types: ['administrative_area_level_2', 'political'],
    },
    {
      long_name: 'New York',
      short_name: 'NY',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'Estados Unidos',
      short_name: 'US',
      types: ['country', 'political'],
    },
  ],
};

export const UsaAddressFixture5 = {
  mainText: '10344 104th Street',
  secondaryText: 'Ozone Park, NY, USA',
  addressComponents: [
    {
      long_name: '10344',
      short_name: '10344',
      types: ['street_number'],
    },
    {
      long_name: '104th Street',
      short_name: '104th St',
      types: ['route'],
    },
    {
      long_name: 'Ozone Park',
      short_name: 'Ozone Park',
      types: ['neighborhood', 'political'],
    },
    {
      long_name: 'Queens',
      short_name: 'Queens',
      types: ['sublocality_level_1', 'sublocality', 'political'],
    },
    {
      long_name: 'Queens County',
      short_name: 'Queens County',
      types: ['administrative_area_level_2', 'political'],
    },
    {
      long_name: 'New York',
      short_name: 'NY',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'United States',
      short_name: 'US',
      types: ['country', 'political'],
    },
    {
      long_name: '11417',
      short_name: '11417',
      types: ['postal_code'],
    },
    {
      long_name: '2221',
      short_name: '2221',
      types: ['postal_code_suffix'],
    },
  ],
};

export const UsaAddressFixture6 = {
  mainText: '10344 104th Street',
  secondaryText: 'Jamaica, NY, USA',
  addressComponents: [
    {
      long_name: '103-44',
      short_name: '103-44',
      types: ['street_number'],
    },
    {
      long_name: '104th Street',
      short_name: '104th St',
      types: ['route'],
    },
    {
      long_name: 'Jamaica',
      short_name: 'Jamaica',
      types: ['neighborhood', 'political'],
    },
    {
      long_name: 'Queens',
      short_name: 'Queens',
      types: ['sublocality_level_1', 'sublocality', 'political'],
    },
    {
      long_name: 'Queens County',
      short_name: 'Queens County',
      types: ['administrative_area_level_2', 'political'],
    },
    {
      long_name: 'New York',
      short_name: 'NY',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'United States',
      short_name: 'US',
      types: ['country', 'political'],
    },
    {
      long_name: '11417',
      short_name: '11417',
      types: ['postal_code'],
    },
  ],
};

export const MexicoAddressFixture1 = {
  mainText: 'VILLA PATRICIA',
  secondaryText: 'Mismaloya, Jalisco, Mexico',
  addressComponents: [
    {
      long_name: 'Mismaloya',
      short_name: 'Mismaloya',
      types: ['locality', 'political'],
    },
    {
      long_name: 'Jalisco',
      short_name: 'Jal.',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'Mexico',
      short_name: 'MX',
      types: ['country', 'political'],
    },
    {
      long_name: '48270',
      short_name: '48270',
      types: ['postal_code'],
    },
  ],
};

export const MexicoAddressFixture2 = {
  mainText: '16 de Septiembre 79',
  secondaryText: 'Centro Histórico de la Ciudad de México, Centro, Ciudad de México, Distrito Federal, México',
  addressComponents: [
    {
      long_name: '79',
      short_name: '79',
      types: ['street_number'],
    },
    {
      long_name: '16 de Septiembre',
      short_name: '16 de Septiembre',
      types: ['route'],
    },
    {
      long_name: 'Centro Histórico de la Ciudad de México',
      short_name: 'Centro Histórico de la Cdad. de México',
      types: ['neighborhood', 'political'],
    },
    {
      long_name: 'Centro',
      short_name: 'Centro',
      types: ['sublocality_level_1', 'sublocality', 'political'],
    },
    {
      long_name: 'Ciudad de México',
      short_name: 'México D.F.',
      types: ['locality', 'political'],
    },
    {
      long_name: 'Ciudad de México',
      short_name: 'CDMX',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'Mexico',
      short_name: 'MX',
      types: ['country', 'political'],
    },
    {
      long_name: '06000',
      short_name: '06000',
      types: ['postal_code'],
    },
  ],
};

export const MexicoAddressFixture3 = {
  mainText: 'C. Cuauhtémoc 835',
  secondaryText: 'Pueblo Nuevo, La Paz, Baja California Sur, México',
  addressComponents: [
    {
      long_name: '835',
      short_name: '835',
      types: ['street_number'],
    },
    {
      long_name: 'Calle Cuauhtémoc',
      short_name: 'C. Cuauhtémoc',
      types: ['route'],
    },
    {
      long_name: 'Pueblo Nuevo',
      short_name: 'Pueblo Nuevo',
      types: ['sublocality_level_1', 'sublocality', 'political'],
    },
    {
      long_name: 'La Paz',
      short_name: 'La Paz',
      types: ['locality', 'political'],
    },
    {
      long_name: 'Baja California Sur',
      short_name: 'B.C.S.',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'Mexico',
      short_name: 'MX',
      types: ['country', 'political'],
    },
    {
      long_name: '23060',
      short_name: '23060',
      types: ['postal_code'],
    },
  ],
};

export const BrazilAddressFixture1 = {
  mainText: "Av. Júlio D'Acia Barreto",
  secondaryText: 'Carvoeira, Florianópolis - SC, Brasil',
  addressComponents: [
    {
      long_name: "Avenida Júlio D'Acia Barreto",
      short_name: "Av. Júlio D'Acia Barreto",
      types: ['route'],
    },
    {
      long_name: 'Carvoeira',
      short_name: 'Carvoeira',
      types: ['sublocality_level_1', 'sublocality', 'political'],
    },
    {
      long_name: 'Florianópolis',
      short_name: 'Florianópolis',
      types: ['administrative_area_level_2', 'political'],
    },
    {
      long_name: 'Santa Catarina',
      short_name: 'SC',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'Brazil',
      short_name: 'BR',
      types: ['country', 'political'],
    },
    {
      long_name: '88040-520',
      short_name: '88040-520',
      types: ['postal_code'],
    },
  ],
};

export const BrazilAddressFixture2 = {
  mainText: 'SQNW 310, Bloco D - 310 Lotus',
  secondaryText: 'SHCNW SQNW - Noroeste, Brasília - DF, Brasil',
  addressComponents: [
    {
      long_name: 'Bloco D',
      short_name: 'Bloco D',
      types: ['subpremise'],
    },
    {
      long_name: 'SQNW 310',
      short_name: 'SQNW 310',
      types: ['route'],
    },
    {
      long_name: 'Noroeste',
      short_name: 'Noroeste',
      types: ['sublocality_level_1', 'sublocality', 'political'],
    },
    {
      long_name: 'Brasília',
      short_name: 'Brasília',
      types: ['administrative_area_level_2', 'political'],
    },
    {
      long_name: 'Distrito Federal',
      short_name: 'DF',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'Brazil',
      short_name: 'BR',
      types: ['country', 'political'],
    },
    {
      long_name: '70687-220',
      short_name: '70687-220',
      types: ['postal_code'],
    },
  ],
};

export const ArgentinaAddressFixture1 = {
  mainText: 'Avenida Pedro Goyena',
  secondaryText: 'Cidade Autônoma de Buenos Aires, Argentina',
  addressComponents: [
    {
      long_name: 'Avenida Pedro Goyena',
      short_name: 'Av. Pedro Goyena',
      types: ['route'],
    },
    {
      long_name: 'Buenos Aires',
      short_name: 'CABA',
      types: ['locality', 'political'],
    },
    {
      long_name: 'Buenos Aires',
      short_name: 'CABA',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'Argentina',
      short_name: 'AR',
      types: ['country', 'political'],
    },
  ],
};

export const ArgentinaAddressFixture2 = {
  mainText: 'Centenario 133',
  secondaryText: 'Cidade Autônoma de Buenos Aires, Argentina',
  addressComponents: [
    {
      long_name: '133',
      short_name: '133',
      types: ['street_number'],
    },
    {
      long_name: 'Centenario',
      short_name: 'Centenario',
      types: ['route'],
    },
    {
      long_name: 'Caballito',
      short_name: 'Caballito',
      types: ['sublocality_level_1', 'sublocality', 'political'],
    },
    {
      long_name: 'Buenos Aires',
      short_name: 'CABA',
      types: ['locality', 'political'],
    },
    {
      long_name: 'Comuna 6',
      short_name: 'Comuna 6',
      types: ['administrative_area_level_2', 'political'],
    },
    {
      long_name: 'Buenos Aires',
      short_name: 'CABA',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'Argentina',
      short_name: 'AR',
      types: ['country', 'political'],
    },
    {
      long_name: 'C1405',
      short_name: 'C1405',
      types: ['postal_code'],
    },
    {
      long_name: 'CJA',
      short_name: 'CJA',
      types: ['postal_code_suffix'],
    },
  ],
};

export const HongKongAddressFixture1 = {
  mainText: '33 Hip Wo Street',
  secondaryText: ' Kwun Tong, Hong Kong',
  addressComponents: [
    {
      long_name: '33',
      short_name: '33',
      types: ['street_number'],
    },
    {
      long_name: 'Hip Wo Street',
      short_name: 'Hip Wo St',
      types: ['route'],
    },
    {
      long_name: 'Kwun Tong',
      short_name: 'Kwun Tong',
      types: ['neighborhood', 'political'],
    },
    {
      long_name: 'Kowloon',
      short_name: 'Kowloon',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'Hong Kong',
      short_name: 'HK',
      types: ['country', 'political'],
    },
  ],
};

export const HongKongAddressFixture2 = {
  mainText: 'Li Po Chun United World College',
  secondaryText: 'Sai Sha Road, Ma On Shan, Hong Kong',
  addressComponents: [
    {
      long_name: '10號',
      short_name: '10號',
      types: ['street_number'],
    },
    {
      long_name: 'Sai Sha Road',
      short_name: 'Sai Sha Rd',
      types: ['route'],
    },
    {
      long_name: 'Ma On Shan',
      short_name: 'Ma On Shan',
      types: ['neighborhood', 'political'],
    },
    {
      long_name: 'New Territories',
      short_name: 'New Territories',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'Hong Kong',
      short_name: 'HK',
      types: ['country', 'political'],
    },
  ],
};

export const ChinaAddressFixture1 = {
  mainText: 'Yunjian Greenland Villa',
  secondaryText: 'Jinxiu Rd (E), Pudong, Xangai, China',
  addressComponents: [
    {
      long_name: 'Jin Xiu Dong Lu',
      short_name: 'Jin Xiu Dong Lu',
      types: ['route'],
    },
    {
      long_name: 'Pu Dong Xin Qu',
      short_name: 'Pu Dong Xin Qu',
      types: ['sublocality_level_1', 'sublocality', 'political'],
    },
    {
      long_name: 'Shang Hai Shi',
      short_name: 'Shang Hai Shi',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'China',
      short_name: 'CN',
      types: ['country', 'political'],
    },
    {
      long_name: '200135',
      short_name: '200135',
      types: ['postal_code'],
    },
  ],
};

export const CanadaAddressFixture1 = {
  mainText: '72 Ave NW',
  secondaryText: 'Edmonton, AB, Canadá',
  addressComponents: [
    {
      long_name: '72 Avenue Northwest',
      short_name: '72 Ave NW',
      types: ['route'],
    },
    {
      long_name: 'Southwest Edmonton',
      short_name: 'Southwest Edmonton',
      types: ['neighborhood', 'political'],
    },
    {
      long_name: 'Edmonton',
      short_name: 'Edmonton',
      types: ['locality', 'political'],
    },
    {
      long_name: 'Alberta',
      short_name: 'AB',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'Canada',
      short_name: 'CA',
      types: ['country', 'political'],
    },
    {
      long_name: 'T6E 1A3',
      short_name: 'T6E 1A3',
      types: ['postal_code'],
    },
  ],
};

export const TurkeyAddressFixture1 = {
  mainText: 'Hisar Park Konutları',
  secondaryText: 'Orhangazi, Küme Sokak, Odunpazarı/Eskişehir, Turquia',
  addressComponents: [
    {
      long_name: 'Küme Sokak',
      short_name: 'Küme Sk.',
      types: ['route'],
    },
    {
      long_name: 'Orhangazi',
      short_name: 'Orhangazi',
      types: ['administrative_area_level_4', 'political'],
    },
    {
      long_name: 'Odunpazarı',
      short_name: 'Odunpazarı',
      types: ['administrative_area_level_2', 'political'],
    },
    {
      long_name: 'Eskişehir',
      short_name: 'Eskişehir',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'Türkiye',
      short_name: 'TR',
      types: ['country', 'political'],
    },
    {
      long_name: '26160',
      short_name: '26160',
      types: ['postal_code'],
    },
  ],
};
