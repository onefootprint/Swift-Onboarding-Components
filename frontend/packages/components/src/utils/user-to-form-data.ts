import type { FormData } from '../@types';

const userToFormData = (key: string): keyof FormData | null => {
  if (key === 'id.email') return 'email';
  if (key === 'id.phone_number') return 'phoneNumber';
  if (key === 'id.first_name') return 'firstName';
  if (key === 'id.middle_name') return 'middleName';
  if (key === 'id.last_name') return 'lastName';
  if (key === 'id.dob') return 'dob';
  if (key === 'id.address_line1') return 'addressLine1';
  if (key === 'id.address_line2') return 'addressLine2';
  if (key === 'id.city') return 'city';
  if (key === 'id.state') return 'state';
  if (key === 'id.country') return 'country';
  if (key === 'id.zip') return 'zip';
  if (key === 'id.ssn9') return 'ssn9';
  if (key === 'id.ssn4') return 'ssn4';
  return null;
};

export default userToFormData;
