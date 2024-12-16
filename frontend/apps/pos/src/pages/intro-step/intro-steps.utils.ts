export const getClassNames = (focusedField: 'phone' | 'select' | null) => {
  if (!focusedField) {
    return {
      phone: '',
      select: 'border-b-0',
    };
  }
  if (focusedField === 'select') {
    return {
      phone: 'border-t-0',
      select: '',
    };
  }
  return {
    phone: '',
    select: 'border-b-0',
  };
};
