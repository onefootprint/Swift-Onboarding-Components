import type { FormData } from '../types/form-data';

const transformDataBeforeVault = (formData: FormData) => {
  const values = Object.fromEntries(
    Object.entries(formData).filter(([_, value]) => value != null && value !== '' && value !== undefined),
  );

  if (typeof values['id.dob'] === 'string') {
    const [month, day, year] = values['id.dob'].split('/');
    values['id.dob'] = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return values as Record<string, string>;
};

export default transformDataBeforeVault;
