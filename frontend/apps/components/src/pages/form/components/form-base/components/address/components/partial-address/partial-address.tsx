import { DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import type { CountrySelectOption } from '@onefootprint/ui';
import { media } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import styled, { css } from 'styled-components';

import CountryField from '../country-field';
import ZipField from '../zip-field';

export type PartialAddressData = {
  country: CountrySelectOption;
  zip: string;
};

const PartialAddress = () => {
  const methods = useFormContext<PartialAddressData>();
  const { watch, resetField } = methods;
  const country = watch('country') ?? DEFAULT_COUNTRY;

  const handleCountryChange = () => {
    resetField('zip');
  };

  return (
    <Row columns={2}>
      <ZipField countryCode={country.value} />
      <CountryField onChange={handleCountryChange} />
    </Row>
  );
};

const Row = styled.div<{ columns: number }>`
  ${({ columns, theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};

    ${media.greaterThan('sm')`
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: ${theme.spacing[4]};
    `}
  `}
`;

export default PartialAddress;
