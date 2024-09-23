import { useEffectOnceStrict } from '@/src/hooks';
import { useOnboardingValidate } from '@/src/queries';
import { getLogger } from '@onefootprint/idv';
import { Box, LoadingSpinner } from '@onefootprint/ui';
import truncate from 'lodash/truncate';
import { useTranslation } from 'react-i18next';
import Notification from '../../../notification';
import { useAuthIdentifyAppMachine } from '../../state';

const { logError, logTrack } = getLogger({ location: 'auth-onboarding-validation' });

const OnboardingValidation = () => {
  const [state, send] = useAuthIdentifyAppMachine();
  const { authToken, isPasskeyAlreadyRegistered } = state.context;
  const { t } = useTranslation('common');
  const mutOnboardingValidate = useOnboardingValidate();
  const shouldDelayCompletionState = isPasskeyAlreadyRegistered;

  useEffectOnceStrict(() => {
    if (!authToken) return;

    mutOnboardingValidate.mutate(
      { authToken },
      {
        onError: (error: unknown) => {
          logError('Onboarding validation error', error);
          send({ type: 'onboardingValidationError', payload: error });
        },
        onSuccess: ({ validationToken }) => {
          logTrack(`Validation token generated: ${truncate(validationToken, { length: 20 })}`);

          if (shouldDelayCompletionState) {
            window.setTimeout(() => {
              send({ type: 'onboardingValidationCompleted', payload: { validationToken } });
            }, 2000);
            return;
          }

          send({ type: 'onboardingValidationCompleted', payload: { validationToken } });
        },
      },
    );
  });

  return (
    <Notification title={t('validating-your-information')} subtitle={t('only-few-seconds')}>
      <Box display="flex" flexDirection="column" alignItems="center" paddingTop={7}>
        <LoadingSpinner />
      </Box>
    </Notification>
  );
};

export default OnboardingValidation;
