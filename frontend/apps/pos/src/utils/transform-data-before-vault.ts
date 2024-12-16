import type { FormData } from '../types/form-data';

const transformDataBeforeVault = (formData: FormData) => {
  const values: FormData = Object.fromEntries(
    Object.entries(formData).filter(([_, value]) => value != null && value !== '' && value !== undefined),
  );
  if (values.dob && typeof values.dob === 'string') {
    const [month, day, year] = values.dob.split('/');
    values.dob = `${year}-${month}-${day}`;
  }
  return values as Record<string, string>;
};

export default transformDataBeforeVault;
