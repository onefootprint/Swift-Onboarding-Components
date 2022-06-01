const masks = {
  en: {
    dob: {
      date: true,
      numericOnly: true,
      delimiter: '/',
      datePattern: ['m', 'd', 'Y'],
    },
    ssn: {
      numericOnly: true,
      delimiters: ['-', '-'],
      blocks: [3, 2, 4],
    },
  },
};

// TODO: Type ISO 3166-1 alpha-2
const useInputMask = (countryCode: 'en') => masks[countryCode];

export default useInputMask;
