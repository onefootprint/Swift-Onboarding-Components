export const googleAddressSearchMockEmpty: google.maps.places.AutocompleteResponse = {
  predictions: [],
};

export const googleAddressSearchMock: google.maps.places.AutocompleteResponse = {
  predictions: [
    {
      description: '74-01 Roosevelt Avenue, Queens, NY, USA',
      matched_substrings: [{ length: 2, offset: 0 }],
      place_id: 'ChIJOT3e7eBfwokRdyhwilgZyBo',
      structured_formatting: {
        main_text: '74-01 Roosevelt Avenue',
        main_text_matched_substrings: [{ length: 2, offset: 0 }],
        secondary_text: 'Queens, NY, USA',
      },
      terms: [
        { offset: 0, value: '74-01' },
        { offset: 6, value: 'Roosevelt Avenue' },
        { offset: 24, value: 'Queens' },
        { offset: 32, value: 'NY' },
        { offset: 36, value: 'USA' },
      ],
      types: ['street_address', 'geocode'],
    },
    {
      description: '74 Wythe Avenue, Brooklyn, NY, USA',
      matched_substrings: [{ length: 2, offset: 0 }],
      place_id: 'ChIJ9baVyUJZwokRNKCLlKjGuGc',
      structured_formatting: {
        main_text: '74 Wythe Avenue',
        main_text_matched_substrings: [{ length: 2, offset: 0 }],
        secondary_text: 'Brooklyn, NY, USA',
      },
      terms: [
        { offset: 0, value: '74' },
        { offset: 3, value: 'Wythe Avenue' },
        { offset: 17, value: 'Brooklyn' },
        { offset: 27, value: 'NY' },
        { offset: 31, value: 'USA' },
      ],
      types: ['premise', 'geocode'],
    },
    {
      description: '745 Saint Johns Place, Brooklyn, NY, USA',
      matched_substrings: [{ length: 2, offset: 0 }],
      place_id: 'ChIJ18ih_51bwokRzrDnWq4imw4',
      structured_formatting: {
        main_text: '745 Saint Johns Place',
        main_text_matched_substrings: [{ length: 2, offset: 0 }],
        secondary_text: 'Brooklyn, NY, USA',
      },
      terms: [
        { offset: 0, value: '745' },
        { offset: 4, value: 'Saint Johns Place' },
        { offset: 23, value: 'Brooklyn' },
        { offset: 33, value: 'NY' },
        { offset: 37, value: 'USA' },
      ],
      types: ['street_address', 'geocode'],
    },
    {
      description: '747 Franklin Avenue, Brooklyn, NY, USA',
      matched_substrings: [{ length: 2, offset: 0 }],
      place_id: 'ChIJudy3zZ9bwokRkXOSHVXi0AE',
      structured_formatting: {
        main_text: '747 Franklin Avenue',
        main_text_matched_substrings: [{ length: 2, offset: 0 }],
        secondary_text: 'Brooklyn, NY, USA',
      },
      terms: [
        { offset: 0, value: '747' },
        { offset: 4, value: 'Franklin Avenue' },
        { offset: 21, value: 'Brooklyn' },
        { offset: 31, value: 'NY' },
        { offset: 35, value: 'USA' },
      ],
      types: ['street_address', 'geocode'],
    },
    {
      description: '740 Empire Boulevard, Brooklyn, NY, USA',
      matched_substrings: [{ length: 2, offset: 0 }],
      place_id: 'ChIJt2xDwH1bwokRgn2ddmJc0GM',
      structured_formatting: {
        main_text: '740 Empire Boulevard',
        main_text_matched_substrings: [{ length: 2, offset: 0 }],
        secondary_text: 'Brooklyn, NY, USA',
      },
      terms: [
        { offset: 0, value: '740' },
        { offset: 4, value: 'Empire Boulevard' },
        { offset: 22, value: 'Brooklyn' },
        { offset: 32, value: 'NY' },
        { offset: 36, value: 'USA' },
      ],
      types: ['street_address', 'geocode'],
    },
  ],
};

export const placeDetailMock = {
  address_components: [
    { long_name: '74-01', short_name: '74-01', types: ['street_number'] },
    {
      long_name: 'Roosevelt Avenue',
      short_name: 'Roosevelt Ave',
      types: ['route'],
    },
    {
      long_name: 'Jackson Heights',
      short_name: 'Jackson Heights',
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
    { long_name: '11372', short_name: '11372', types: ['postal_code'] },
  ],
  name: '74-01 Roosevelt Ave',
  place_id: 'ChIJOT3e7eBfwokRdyhwilgZyBo',
};
