import { putOrgPlaybooksByPlaybookIdMutation } from '@onefootprint/axios/dashboard';
import { getErrorMessage } from '@onefootprint/request';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { InlineAlert, LoadingSpinner, Stack } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
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
  const mutation = useMutation(
    putOrgPlaybooksByPlaybookIdMutation({
      headers: { 'X-Fp-Dry-Run': true },
    }),
  );

  const validateChanges = async () => {
    mutation.mutate({
      path: {
        playbookId: playbook.playbookId,
      },
      body: {
        expectedLatestObcId: playbook.id,
        newOnboardingConfig: createPayload(formData),
      },
    });
  };

  useEffect(() => {
    validateChanges();
  }, []);

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
        <div>
          {mutation.isPending && (
            <div className="mt-3 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          )}
          {mutation.data && <PlaybookDiff playbookA={playbook} playbookB={mutation.data} />}
          {mutation.error && <InlineAlert variant="error">{getErrorMessage(mutation.error)}</InlineAlert>}
        </div>
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
