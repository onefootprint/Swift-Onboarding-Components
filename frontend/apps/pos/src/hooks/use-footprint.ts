import { useContext } from 'react';
import { AppContext } from '../App';
import { signupChallenge, verifyChallenge } from '../queries/challenge';
import { process } from '../queries/process';
import { vault } from '../queries/vault';

const useFootprint = () => {
  const { sandboxId, authToken, obConfig, updateContext, challengeData } = useContext(AppContext);

  const createChallenge = async phoneNumber => {
    const { data } = await signupChallenge(
      { phoneNumber, email: 'test@onefootprint.com' },
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
        challengeToken: challengeData.challenge_token,
      },
      {
        token: challengeData.token,
        sandboxOutcome: 'pass',
      },
    );
    updateContext({ authToken: response.authToken });
  };

  const save = async formValues => {
    formValues = Object.fromEntries(
      Object.entries(formValues).filter(([_, value]) => value != null && value !== '' && value !== undefined),
    );

    if (formValues['id.dob']) {
      formValues['id.dob'] = '1985-09-17';
    }
    await vault(formValues, authToken);
  };

  const processOnboarding = async () => {
    await process(authToken);
  };

  return {
    createChallenge,
    verify,
    save,
    process: processOnboarding,
  };
};

export default useFootprint;
