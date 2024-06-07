const transformCase = (value: string, to: 'upper' | 'lower' | 'first-letter-upper-only') => {
  if (value.length === 0) return value;
  switch (to) {
    case 'upper':
      return value.toUpperCase();
    case 'lower':
      return value.toLowerCase();
    case 'first-letter-upper-only':
      return value.charAt(0).toUpperCase() + (value.length > 1 ? value.slice(1) : '');
    default:
      return value;
  }
};

export default transformCase;
