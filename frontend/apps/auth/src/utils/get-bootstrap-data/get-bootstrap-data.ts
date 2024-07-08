import type { FootprintAuthDataProps } from '@onefootprint/footprint-js';

const isValidString = (x: unknown) => typeof x === 'string' && x.length > 0;

const getAuthBootstrapData = (props?: FootprintAuthDataProps) => {
  const obj = props?.bootstrapData || props?.userData || Object.create(null);
  const output = Object.create(null);

  if (isValidString(obj?.['id.email']) && obj['id.email'].includes('@')) {
    output.email = obj['id.email'];
  }
  if (isValidString(obj?.['id.phone_number'])) {
    output.phoneNumber = obj['id.phone_number'];
  }

  return output;
};

export default getAuthBootstrapData;
