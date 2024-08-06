import type { CountryRecord } from '@onefootprint/global-constants';
import { DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import type { SubmitDocTypeResponse } from '@onefootprint/types';
import type { SupportedIdDocTypes } from '@onefootprint/types/src/data/id-doc-type';

import { useIdDocMachine } from '../../components/machine-provider';
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
        country: country.value ?? DEFAULT_COUNTRY.value,
        id,
      },
    });
  };

  const handleConsentSubmit = () => {
    send({ type: 'consentReceived' });
  };

  return (
    <IdDocCountryAndTypeContainer
      onSubmitDocTypeSuccess={handleSubmitDocTypeSuccess}
      onConsentSubmit={handleConsentSubmit}
    />
  );
};

export default IdDocCountryAndType;
