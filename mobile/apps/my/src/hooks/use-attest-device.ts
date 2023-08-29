import request from '@onefootprint/request';
import {
  CreateDeviceAttestationRequest,
  GetDeviceAttestationChallengeRequest,
  GetDeviceAttestationChallengeResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { NativeModules, Platform } from 'react-native';

import { AUTH_HEADER } from '@/config/constants';

const { DeviceAttestation } = NativeModules;

const getSignalsAsync = async (
  webauthnPublicKey: string | null,
  challenge: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    DeviceAttestation.attest(webauthnPublicKey, challenge, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.attestation);
      }
    });
  });
};

const getDeviceAttestationChallenge = async (
  authToken: string,
  payload: GetDeviceAttestationChallengeRequest,
) => {
  const { data } = await request<GetDeviceAttestationChallengeResponse>({
    method: 'POST',
    url: '/hosted/user/attest_device/challenge',
    data: payload,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return data;
};

const createDeviceAttestation = async (
  authToken: string,
  payload: CreateDeviceAttestationRequest,
) => {
  const { data } = await request({
    method: 'POST',
    url: '/hosted/user/attest_device',
    data: payload,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return data;
};

const getAttestation = async ({
  authToken,
  webauthnPublicKey,
}: {
  authToken: string;
  webauthnPublicKey: string | null;
}) => {
  if (Platform.OS !== 'ios') return null;
  const { attestationChallenge, state } = await getDeviceAttestationChallenge(
    authToken,
    {
      deviceType: 'ios',
    },
  );
  const attestation = await getSignalsAsync(
    webauthnPublicKey,
    attestationChallenge,
  );
  await createDeviceAttestation(authToken, {
    attestation,
    state: state.replaceAll('"', ''),
  });
};

const useAttestDevice = () => {
  return useMutation(
    ({
      authToken,
      webauthnPublicKey,
    }: {
      authToken: string;
      webauthnPublicKey: string | null;
    }) => getAttestation({ authToken, webauthnPublicKey }),
  );
};

export default useAttestDevice;
