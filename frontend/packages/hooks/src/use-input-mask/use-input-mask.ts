const masks = {
  'en-US': {
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
    lastFourSsn: {
      numericOnly: true,
      blocks: [4],
    },
  },
};

const useInputMask = (bcp47Code: 'en-US') => masks[bcp47Code];

export default useInputMask;
