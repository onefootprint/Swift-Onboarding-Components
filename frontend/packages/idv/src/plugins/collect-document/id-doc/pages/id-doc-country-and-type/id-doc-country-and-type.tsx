import type { CountryRecord } from '@onefootprint/global-constants';
import { DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import { type CountryCode, IdDI, type SubmitDocTypeResponse } from '@onefootprint/types';
import type { SupportedIdDocTypes } from '@onefootprint/types/src/data/id-doc-type';
import { useDecryptUser } from '../../../../../queries';

import { useEffect, useState } from 'react';
import { isObject } from '../../../../../utils/type-guards';
import { useIdDocMachine } from '../../components/machine-provider';
import IdDocCountryAndTypeContainer from './components/id-doc-country-and-type-container';
import Loading from './components/loading';

const IdDocCountryAndType = () => {
  const [state, send] = useIdDocMachine();
  const mutDecryptUser = useDecryptUser();
  const [userCountryCode, setUserCountryCode] = useState<CountryCode | undefined>();

  const {
    authToken,
    idDoc: { country: selectedCountryCode },
    requirement: {
      config: { supportedCountryAndDocTypes: supportedCountries },
    },
  } = state.context;

  const hasOneSupportedCountry = isObject(supportedCountries) && Object.keys(supportedCountries).length === 1;

  const handleSubmitDocTypeSuccess = (
    data: SubmitDocTypeResponse,
    country: CountryRecord,
    docType: `${SupportedIdDocTypes}`,
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

  useEffect(() => {
    if (!authToken || hasOneSupportedCountry || selectedCountryCode || userCountryCode) return;

    if (mutDecryptUser.isIdle && !mutDecryptUser.isPending) {
      mutDecryptUser.mutate(
        { authToken, fields: [IdDI.country] },
        {
          onError: console.warn,
          onSuccess: res => {
            const countryCode = res[IdDI.country] as CountryCode | undefined;
            if (countryCode) {
              setUserCountryCode(countryCode);
            }
          },
        },
      );
    }
  }, [
    authToken,
    hasOneSupportedCountry,
    mutDecryptUser.isIdle,
    mutDecryptUser.isPending,
    selectedCountryCode,
    userCountryCode,
  ]);

  return mutDecryptUser.isPending ? (
    <Loading />
  ) : (
    <IdDocCountryAndTypeContainer
      onSubmitDocTypeSuccess={handleSubmitDocTypeSuccess}
      onConsentSubmit={handleConsentSubmit}
      userCountryCode={userCountryCode}
    />
  );
};

export default IdDocCountryAndType;
