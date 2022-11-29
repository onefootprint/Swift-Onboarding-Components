import {
  useIdentify,
  useLoginChallenge,
  useSignupChallenge,
} from '@onefootprint/footprint-elements';
import {
  ChallengeData,
  ChallengeKind,
  Identifier,
  IdentifyResponse,
  IdentifyType,
  LoginChallengeResponse,
  SignupChallengeResponse,
} from '@onefootprint/types';
import { BootstrapData } from 'src/hooks/use-bifrost-machine';
import { useEffectOnce } from 'usehooks-ts';

const canSendSmsLoginChallenge = (
  userFound: boolean,
  availableChallengeKinds?: ChallengeKind[],
) => userFound && availableChallengeKinds?.includes(ChallengeKind.sms);

type UseProcessBootstrapDataArgs = {
  bootstrapData: BootstrapData;
  identifyType: IdentifyType;
  options: {
    onSuccess: (userFound: boolean, challengeData: ChallengeData) => void;
    onError: () => void;
  };
};

const useProcessBootstrapData = (args: UseProcessBootstrapDataArgs) => {
  const {
    bootstrapData: { email, phoneNumber },
    identifyType,
    options,
  } = args;

  const identifyMutation = useIdentify();
  const loginChallengeMutation = useLoginChallenge();
  const signupChallengeMutation = useSignupChallenge();

  const identify = (
    identifier: Identifier,
    onSuccess: (data: IdentifyResponse) => void,
  ) => {
    identifyMutation.mutate(
      {
        identifier,
      },
      {
        onSuccess,
        onError: options.onError,
      },
    );
  };

  const sendSmsLoginChallenge = (
    identifier: Identifier,
    onSuccess: (data: LoginChallengeResponse) => void,
  ) => {
    loginChallengeMutation.mutate(
      {
        identifier,
        preferredChallengeKind: ChallengeKind.sms,
        identifyType,
      },
      {
        onSuccess,
        onError: options.onError,
      },
    );
  };

  const sendSmsSignupChallenge = (
    onSuccess: (data: SignupChallengeResponse) => void,
  ) => {
    if (!phoneNumber) {
      options.onError();
      return;
    }

    signupChallengeMutation.mutate(
      { phoneNumber, identifyType },
      {
        onSuccess,
        onError: options.onError,
      },
    );
  };

  const processPhoneData = () => {
    if (!phoneNumber) {
      options.onError();
      return;
    }

    identify({ phoneNumber }, identifyResponse => {
      const { userFound, availableChallengeKinds } = identifyResponse;
      if (canSendSmsLoginChallenge(userFound, availableChallengeKinds)) {
        sendSmsLoginChallenge({ phoneNumber }, ({ challengeData }) => {
          options.onSuccess(userFound, challengeData);
        });
      } else {
        sendSmsSignupChallenge(({ challengeData }) => {
          options.onSuccess(userFound, challengeData);
        });
      }
    });
  };

  const processEmailData = () => {
    if (!email) {
      options.onError();
      return;
    }

    identify({ email }, identifyResponse => {
      const { userFound, availableChallengeKinds } = identifyResponse;
      if (canSendSmsLoginChallenge(userFound, availableChallengeKinds)) {
        sendSmsLoginChallenge({ email }, ({ challengeData }) => {
          options.onSuccess(userFound, challengeData);
        });
      } else if (phoneNumber) {
        processPhoneData();
      } else {
        options.onError();
      }
    });
  };

  useEffectOnce(() => {
    if (email) {
      processEmailData();
    } else if (phoneNumber) {
      processPhoneData();
    } else {
      options.onError();
    }
  });
};

export default useProcessBootstrapData;
