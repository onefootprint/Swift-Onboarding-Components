const masks = {
  en: {
    dob: {
      date: true,
      delimiter: '/',
      datePattern: ['m', 'd', 'Y'],
    },
  },
};

// TODO: Type ISO 3166-1 alpha-2
const useInputMask = (countryCode: 'en') => masks[countryCode];

export default useInputMask;
