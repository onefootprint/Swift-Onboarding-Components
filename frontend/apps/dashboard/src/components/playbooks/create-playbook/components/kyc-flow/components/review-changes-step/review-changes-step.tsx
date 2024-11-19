import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { InlineAlert, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Header from '../../../header';

export type ReviewChangesStepProps = {
  onBack: () => void;
  meta: {
    playbook: OnboardingConfiguration;
    hasChanges: boolean;
  };
};

const ReviewChangesStep = ({ onBack, meta }: ReviewChangesStepProps) => {
  return (
    <Stack flexDirection="column" gap={7}>
      {meta.hasChanges ? <WithChanges /> : <NoChanges onBack={onBack} />}
    </Stack>
  );
};

const WithChanges = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.review-changes' });

  return (
    <div className="flex flex-col gap-2">
      <Header title={t('title')} />
      <InlineAlert variant="warning">{t('warning')}</InlineAlert>
    </div>
  );
};

const NoChanges = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.review-changes' });

  return (
    <>
      <Header title={t('title')} subtitle={t('subtitle')} />
      <form
        id="playbook-form"
        onReset={e => {
          e.preventDefault();
          onBack();
        }}
      />
    </>
  );
};

export default ReviewChangesStep;
