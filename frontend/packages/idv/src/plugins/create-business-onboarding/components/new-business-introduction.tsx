import { IcoStore24, IcoUser24 } from '@onefootprint/icons';
import { Button, Stack } from '@onefootprint/ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { SharedState } from '..';
import { HeaderTitle, InfoBox, NavigationHeader } from '../../../components';
import useBusinessOnboarding from '../hooks/use-business-onboarding';

type NewBusinessIntroductionProps = {
  state: SharedState;
};

const NewBusinessIntroduction = ({ state }: NewBusinessIntroductionProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages' });
  const { onDone, authToken, kybFixtureResult } = state;
  const useBusinessOnboardingMutation = useBusinessOnboarding({ authToken, kybFixtureResult });
  useEffect(() => {
    // Start the business onboarding as soon as the user visits this screen, no need to wait for them
    // to read and click the continue button to move on.
    useBusinessOnboardingMutation.mutate({});
  }, []);

  return (
    <Stack flexDirection="column" rowGap={7} justifyContent="center" alignItems="center">
      <NavigationHeader
        leftButton={{
          confirmClose: true,
          variant: 'close',
        }}
      />
      <HeaderTitle title={t('introduction.title')} subtitle={t('introduction.subtitle')} />
      <InfoBox
        items={[
          {
            title: t('introduction.guidelines.beneficial-owner.title'),
            description: t('introduction.guidelines.beneficial-owner.description'),
            Icon: IcoStore24,
          },
          {
            title: t('introduction.guidelines.bo-kyc.title'),
            description: t('introduction.guidelines.bo-kyc.description'),
            Icon: IcoUser24,
          },
        ]}
        variant="default"
      />
      <Button fullWidth onClick={() => onDone()} size="large" loading={useBusinessOnboardingMutation.isPending}>
        {t('cta.continue')}
      </Button>
    </Stack>
  );
};

export default NewBusinessIntroduction;
