import { useContext } from 'react';
import { AppContext } from '../../App';
import { signupChallenge, verifyChallenge } from '../../queries/challenge';

const useFootprint = () => {
  const { sandboxId, obConfig, updateContext, challengeData } = useContext(AppContext);

  const createChallenge = async phoneNumber => {
    const { data } = await signupChallenge(
      { phoneNumber },
      {
        obConfigKey: obConfig.key,
        sandboxId,
      },
    );
    updateContext({ challengeData: data.challenge_data });
  };

  const verify = async verificationCode => {
    const response = await verifyChallenge(
      {
        challenge: verificationCode,
        // @ts-ignore
        challengeToken: challengeData.challenge_token,
      },
      {
        // @ts-ignore
        token: challengeData.token,
        sandboxOutcome: 'pass',
      },
    );
    console.log(response);
    // setContext(prev => ({
    //   ...prev,
    //   vaultingToken: response.vaultingToken,
    //   verifiedAuthToken: response.authToken,
    //   authTokenStatus: AuthTokenStatus.validWithSufficientScope,
    // }));

    // Implementation will be added later
  };

  const saveAndComplete = async _formValues => {
    // Implementation will be added later
  };

  return {
    createChallenge,
    verify,
    saveAndComplete,
  };
};

export default useFootprint;
