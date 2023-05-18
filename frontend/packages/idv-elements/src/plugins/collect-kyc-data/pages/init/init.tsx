import {
  CdoToDiMap,
  DataIdentifier,
  DecryptUserResponse,
  IdDI,
} from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import { useCollectKycDataMachine } from '../../components/machine-provider';
import useDecryptUser from './hooks/use-decrypt-user';

// These fields are decryptable with any auth token. Other fields are only decryptable if authed
// with biometric
const BASIC_PROFILE_DIS: DataIdentifier[] = [
  IdDI.firstName,
  IdDI.lastName,
  IdDI.dob,
  IdDI.addressLine1,
  IdDI.addressLine2,
  IdDI.city,
  IdDI.state,
  IdDI.country,
  IdDI.zip,
];

const Init = () => {
  const [state, send] = useCollectKycDataMachine();
  const { authToken, requirement } = state.context;
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

  const handleError = (err: any) => {
    // If we fail to decrypt the existing information on the vault, it's no big deal - we can move
    // forward and just have the user re-enter their info instead of taking the already portable info
    // But log anyways because this shouldn't happen :)
    console.log(err);
    send({
      type: 'initialized',
      payload: {},
    });
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

  return (
    <Container>
      <LoadingIndicator />
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: var(--loading-container-min-height);
  justify-content: center;
  text-align: center;
`;

export default Init;
