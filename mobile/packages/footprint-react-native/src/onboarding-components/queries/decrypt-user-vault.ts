import type { DataIdentifier } from '@onefootprint/types';
import type { FormValues, SupportedLocale } from 'src/types';
import request from 'src/utils/request';
import { fromISO8601ToUSDate, fromUsDateToStringInput } from '../utils/date-formatter';

const formatDecryptedData = (data: FormValues, locale: SupportedLocale) => {
  if (typeof data['id.dob'] === 'string') {
    const usDobString = fromISO8601ToUSDate(data['id.dob']);
    data['id.dob'] = fromUsDateToStringInput(locale, usDobString ?? '');
    if (data['id.dob'] == null || data['id.dob'] === '') {
      throw new Error('Invalid date format. Error in formatting date.');
    }
  }

  if (typeof data['id.visa_expiration_date'] === 'string') {
    const usVisaExpirationDateString = fromISO8601ToUSDate(data['id.visa_expiration_date']);
    data['id.visa_expiration_date'] = fromUsDateToStringInput(locale, usVisaExpirationDateString ?? '');
    if (data['id.visa_expiration_date'] == null || data['id.visa_expiration_date'] === '') {
      throw new Error('Invalid date format. Error in formatting visa expiration date.');
    }
  }

  return data;
};

const decryptUserVault = async ({
  fields,
  authToken,
  locale,
}: { fields: DataIdentifier[]; authToken: string; locale: SupportedLocale }) => {
  // We can't decrypt these fields for now
  // they will require a step up, which we don't support yet
  const filteredFields = fields.filter(
    field => field !== 'id.ssn9' && field !== 'id.ssn4' && field !== 'id.us_tax_id' && !field.startsWith('document.'),
  );

  const response = await request<FormValues>({
    method: 'POST',
    url: '/hosted/user/vault/decrypt',
    data: { fields: filteredFields },
    disableCaseConverter: true,
    headers: {
      'X-Fp-Authorization': authToken,
    },
  });
  return formatDecryptedData(response, locale);
};

export default decryptUserVault;
