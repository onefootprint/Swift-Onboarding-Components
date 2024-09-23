import type { DataIdentifier } from '@onefootprint/types';
import type { FormValues } from '../../../types';
import request from '../utils/request';

const decryptUserVault = async ({ fields, authToken }: { fields: DataIdentifier[]; authToken: string }) => {
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
  return response;
};

export default decryptUserVault;
