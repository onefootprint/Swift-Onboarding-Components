import request from '@onefootprint/request';
import type {
  CreateDeviceAttestationRequest,
  GetDeviceAttestationChallengeRequest,
  GetDeviceAttestationChallengeResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { NativeModules, Platform } from 'react-native';

import { AUTH_HEADER } from '@/config/constants';
import { Events, useAnalytics } from '@/utils/analytics';

const { DeviceAttestation } = NativeModules;

const getSignalsAsync = async (
  deviceResponseJson: string | null,
  challenge: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    DeviceAttestation.attest(deviceResponseJson, challenge, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.attestation || null);
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
  deviceResponseJson,
}: {
  authToken: string;
  deviceResponseJson: string | null;
}) => {
  if (Platform.OS !== 'ios') return null;
  const { attestationChallenge, state } = await getDeviceAttestationChallenge(
    authToken,
    {
      deviceType: 'ios',
    },
  );
  const attestation = await getSignalsAsync(
    deviceResponseJson,
    attestationChallenge,
  );
  if (attestation) {
    await createDeviceAttestation(authToken, {
      attestation,
      state,
    });
  }
};

const useAttestDevice = () => {
  const analytics = useAnalytics();

  return useMutation(
    ({
      authToken,
      deviceResponseJson,
    }: {
      authToken: string;
      deviceResponseJson: string | null;
    }) => getAttestation({ authToken, deviceResponseJson }),
    {
      onError: error => {
        analytics.track(Events.AttestationFailed, { error });
      },
    },
  );
};

export default useAttestDevice;
