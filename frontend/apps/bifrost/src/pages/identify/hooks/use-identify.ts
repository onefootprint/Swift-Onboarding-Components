import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import {
  ChallengeData,
  ChallengeKind,
} from 'src/utils/state-machine/identify/types';
import { IdentifyType } from 'src/utils/state-machine/types';

import getRetryDisabledUntil from './get-retry-disabled-until';

export type IdentifyRequest = {
  identifier: {
    email?: string;
    phoneNumber?: string;
  };
  identifyType: IdentifyType;
  preferredChallengeKind?: ChallengeKind;
};

export type IdentifyResponse = {
  userFound: boolean;
  challengeData?: ChallengeData;
  availableChallengeKinds?: ChallengeKind[];
};

type PrivateChallengeData = {
  challengeToken: string;
  challengeKind: ChallengeKind;
  phoneNumberLastTwo: string;
  phoneCountry: string;
  biometricChallengeJson?: string;
  timeBeforeRetryS: number;
};

type PrivateIdentifyResponse = {
  userFound: boolean;
  challengeData?: PrivateChallengeData;
  availableChallengeKinds?: ChallengeKind[];
};

const identifyRequest = async (payload: IdentifyRequest) => {
  const response = await request<PrivateIdentifyResponse>({
    method: 'POST',
    url: '/hosted/identify',
    data: payload,
  });
  const { userFound, challengeData, availableChallengeKinds } = response.data;

  return {
    userFound,
    availableChallengeKinds,
    challengeData: challengeData
      ? {
          challengeToken: challengeData.challengeToken,
          challengeKind: challengeData.challengeKind,
          phoneNumberLastTwo: challengeData.phoneNumberLastTwo,
          phoneCountry: challengeData.phoneCountry,
          biometricChallengeJson: challengeData.biometricChallengeJson,
          retryDisabledUntil: getRetryDisabledUntil(
            challengeData.timeBeforeRetryS,
          ),
        }
      : undefined,
  };
};
const useIdentify = () =>
  useMutation<IdentifyResponse, RequestError, IdentifyRequest>(identifyRequest);

export default useIdentify;
