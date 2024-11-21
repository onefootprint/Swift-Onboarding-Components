import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { InlineAlert, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import PlaybookDiff from 'src/components/playbooks/playbook-diff';
import Header from '../../../header';
import createPayload from '../../utils/create-payload';
import type { StateFormData } from '../../utils/reducer';

export type ReviewChangesStepProps = {
  onBack: () => void;
  onSubmit: () => void;
  meta: {
    formData: StateFormData;
    hasChanges: boolean;
    playbook: OnboardingConfiguration;
  };
};

const ReviewChangesStep = ({ onBack, onSubmit, meta }: ReviewChangesStepProps) => {
  return (
    <Stack flexDirection="column" gap={7}>
      {meta.hasChanges ? (
        <WithChanges onSubmit={onSubmit} onBack={onBack} meta={meta} />
      ) : (
        <NoChanges onBack={onBack} />
      )}
    </Stack>
  );
};

const WithChanges = ({ onBack, onSubmit, meta: { playbook, formData } }: ReviewChangesStepProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.review-changes' });

  return (
    <form
      id="playbook-form"
      onSubmit={event => {
        event.preventDefault();
        onSubmit();
      }}
      onReset={event => {
        event.preventDefault();
        onBack();
      }}
    >
      <div className="flex flex-col gap-2">
        <Header title={t('title')} />
        <InlineAlert variant="warning" marginBottom={7}>
          {t('warning')}
        </InlineAlert>
        <PlaybookDiff oldPlaybook={playbook} newPlaybookPayload={createPayload(formData)} />
      </div>
    </form>
  );
};

const NoChanges = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.review-changes' });

  return (
    <>
      <form
        id="playbook-form"
        onReset={event => {
          event.preventDefault();
          onBack();
        }}
      >
        <Header title={t('title')} subtitle={t('subtitle')} />
      </form>
    </>
  );
};

export default ReviewChangesStep;
