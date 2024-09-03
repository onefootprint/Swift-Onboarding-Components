import { IdDocOutcome, IdVerificationOutcome, OverallOutcome, type PublicOnboardingConfig } from '@onefootprint/types';
import { Box, Button, Stack } from '@onefootprint/ui';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { HeaderTitle, NavigationHeader } from '../../../../components';
import { getRandomID } from '../../../../utils';
import type { SandboxOutcomeFormData } from '../../types';
import IdDocOutcomeSelect from '../id-doc-outcome-select';
import OverallOutcomeSelect from '../overall-outcome-select';
import TestIdInput from '../test-id-input';

type SandboxOutcomeContainerProps = {
  config?: PublicOnboardingConfig;
  collectTestId?: boolean;
  sandboxId?: string;
};

export const SandboxOutcomeContainer = ({ config, collectTestId }: SandboxOutcomeContainerProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.pages.sandbox-outcome',
  });
  const {
    formState: { errors },
  } = useFormContext<SandboxOutcomeFormData>();

  const shouldShowIdDocOutcome = !!config?.requiresIdDoc;
  const allowRealOutcome = config?.canMakeRealDocScanCallsInSandbox;

  return (
    <Stack flexDirection="column">
      <NavigationHeader leftButton={{ variant: 'close' }} />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Box
        marginBlock={7}
        padding={5}
        borderWidth={1}
        borderStyle="solid"
        borderRadius="default"
        borderColor="tertiary"
      >
        <Stack gap={5} flexDirection="column">
          <OverallOutcomeSelect config={config} />
          {shouldShowIdDocOutcome && <IdDocOutcomeSelect allowRealOutcome={allowRealOutcome} />}
          {collectTestId && <TestIdInput />}
        </Stack>
      </Box>
      <Button fullWidth type="submit" disabled={!!errors?.testID} size="large">
        {t('cta')}
      </Button>
    </Stack>
  );
};

const SandboxOutcomeFormWrapper = ({
  config,
  collectTestId,
  onSubmit,
  sandboxId,
}: SandboxOutcomeContainerProps & { onSubmit: (formData: SandboxOutcomeFormData) => void }) => {
  const formMethods = useForm<SandboxOutcomeFormData>({
    defaultValues: {
      overallOutcome: OverallOutcome.success,
      docVerificationOutcome: IdVerificationOutcome.simulated,
      idDocOutcome: config?.requiresIdDoc ? IdDocOutcome.success : undefined,
      testID: collectTestId ? sandboxId ?? getRandomID() : undefined,
    },
    mode: 'onChange',
  });

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <SandboxOutcomeContainer config={config} collectTestId={collectTestId} />
      </form>
    </FormProvider>
  );
};

export default SandboxOutcomeFormWrapper;
