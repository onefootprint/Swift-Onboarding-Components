export const getPlacePredictions = jest.fn();

export const defaultGoogleMapsData = [
  {
    description: '14 Linda Street, Westborough, MA, USA',
    matched_substrings: [
      {
        length: 15,
        offset: 0,
      },
    ],
    place_id:
      'EiUxNCBMaW5kYSBTdHJlZXQsIFdlc3Rib3JvdWdoLCBNQSwgVVNBIjASLgoUChIJgxth39EL5IkRZl4CI3HDMhkQDioUChIJ4Zbf8NEL5IkR-LgPMKdH4Ro',
    reference:
      'EiUxNCBMaW5kYSBTdHJlZXQsIFdlc3Rib3JvdWdoLCBNQSwgVVNBIjASLgoUChIJgxth39EL5IkRZl4CI3HDMhkQDioUChIJ4Zbf8NEL5IkR-LgPMKdH4Ro',
    structured_formatting: {
      main_text: '14 Linda Street',
      main_text_matched_substrings: [
        {
          length: 15,
          offset: 0,
        },
      ],
      secondary_text: 'Westborough, MA, USA',
    },
    terms: [
      {
        offset: 0,
        value: '14 Linda Street',
      },
      {
        offset: 17,
        value: 'Westborough',
      },
      {
        offset: 30,
        value: 'MA',
      },
      {
        offset: 34,
        value: 'USA',
      },
    ],
    types: ['street_address', 'geocode'],
  },
];

export const createGoogleMapsSpy = (
  type = 'success',
  data = defaultGoogleMapsData,
) => {
  global.google = {
    maps: {
      places: {
        // @ts-ignore
        AutocompleteService: class {
          getPlacePredictions =
            type === 'opts'
              ? getPlacePredictions
              : (_: any, cb: (dataArg: any, status: string) => void) => {
                  setTimeout(() => {
                    cb(
                      type === 'success' ? data : null,
                      type === 'success' ? 'OK' : 'ERROR',
                    );
                  }, 500);
                };
        },
      },
    },
  };
};
