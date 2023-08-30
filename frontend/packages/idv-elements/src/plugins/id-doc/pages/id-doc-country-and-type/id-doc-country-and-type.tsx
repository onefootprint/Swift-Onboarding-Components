import { CountryRecord, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import { SubmitDocTypeResponse } from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types/src/data/id-doc-type';
import React from 'react';

import { useIdDocMachine } from '../../components/machine-provider';
import { getCountryFromCode } from '../../utils/get-country-from-code';
import IdDocCountryAndTypeContainer from './components/id-doc-country-and-type-container';

const IdDocCountryAndType = () => {
  const [, send] = useIdDocMachine();
  const handleSubmitDocTypeSuccess = (
    data: SubmitDocTypeResponse,
    country: CountryRecord,
    docType: SupportedIdDocTypes,
  ) => {
    const { id } = data;
    send({
      type: 'receivedCountryAndType',
      payload: {
        type: docType,
        country:
          getCountryFromCode(country.value)?.value ?? DEFAULT_COUNTRY.value,
        id,
      },
    });
  };

  return (
    <IdDocCountryAndTypeContainer
      onSubmitDocTypeSuccess={handleSubmitDocTypeSuccess}
    />
  );
};

export default IdDocCountryAndType;
