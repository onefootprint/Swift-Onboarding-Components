import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import {
  CdoToDiMap,
  DataIdentifier,
  DecryptUserResponse,
  IdDI,
} from '@onefootprint/types';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import { useCollectKycDataMachine } from '../../components/machine-provider';
import useDecryptUser from './hooks/use-decrypt-user';

// These fields are decryptable with any auth token. Other fields are only decryptable if authed
// with biometric
const BASIC_PROFILE_DIS: DataIdentifier[] = [
  IdDI.firstName,
  IdDI.lastName,
  IdDI.city,
  IdDI.state,
  IdDI.country,
  IdDI.zip,
];

const Init = () => {
  const { t } = useTranslation('pages.init');
  const [state, send] = useCollectKycDataMachine();
  const { authToken, requirement } = state.context;
  const [error, setError] = useState(false);
  const decryptUserMutation = useDecryptUser();
  const populatedDis = requirement.populatedAttributes.flatMap(
    cdo => CdoToDiMap[cdo],
  );

  const handleSuccess = (response: DecryptUserResponse) => {
    const decryptedEntries = Object.entries(response)
      .filter(([di]) => Object.values(IdDI).includes(di as IdDI))
      .map(([di, value]) => [
        di,
        {
          value: value || '',
          decrypted: true,
          scrubbed: false,
        },
      ]);
    // Create a scrubbed entry for populated attributes that weren't decrypted - this allows us
    // to skip collection of them and display a scrubbed value showing that they already exist
    // TODO handle case where value is empty from the backend
    const scrubbedEntries = populatedDis
      .filter(di => !BASIC_PROFILE_DIS.includes(di))
      .map(di => [
        di as string,
        {
          value: '',
          decrypted: false,
          scrubbed: true,
        },
      ]);
    const payload = Object.fromEntries(
      decryptedEntries.concat(scrubbedEntries),
    );
    send({
      type: 'initialized',
      payload,
    });
  };

  const handleError = () => {
    setError(true);
  };

  useEffectOnce(() => {
    // Decrypt the basic fields that have already been populated.
    // Don't automatically decrypt any sensitive fields - we will have an explicit reveal button
    // for them. We also are not sure if our auth method has permissions to decrypt them yet
    const fields = populatedDis.filter(di => BASIC_PROFILE_DIS.includes(di));
    if (!fields.length) {
      // Short circuit to prevent the unnecessary network request. Still need to call the success
      // handler in order to populate scrubbed info
      handleSuccess({});
      return;
    }
    decryptUserMutation.mutate(
      { fields, authToken },
      {
        onSuccess: handleSuccess,
        onError: handleError,
      },
    );
  });

  // TODO could we just move on if this fails without displaying an error message?
  // We would presumably have a `reveal` button for all data that exists in the vault that isn't
  // yet decrypted
  if (error) {
    return (
      <Container>
        <TitleContainer>
          <IcoForbid40 color="error" />
          <Typography variant="heading-3">{t('error.title')}</Typography>
        </TitleContainer>
        <Typography variant="body-2">{t('error.description')}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <LoadingIndicator />
    </Container>
  );
};

const TitleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[2]};
    justify-content: center;
  `}
`;

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: var(--loading-container-min-height);
  justify-content: center;
  text-align: center;
`;

export default Init;
