import { IcoMinusSmall16, IcoPlusSmall16 } from '@onefootprint/icons';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { InlineAlert, LoadingSpinner, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useDiffPlaybooks from 'src/hooks/use-diff-playbooks';
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
  const diffMutation = useDiffPlaybooks({
    currentPlaybook: playbook,
    newPlaybookPayload: createPayload(formData),
  });

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
        {diffMutation.isPending && (
          <div className="mt-3 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
        {diffMutation.data?.length && (
          <ul className="flex flex-col gap-6">
            {diffMutation.data.map(diff => (
              <li key={diff.label} className="flex flex-col gap-3">
                <h3 className="text-secondary text-label-3">{diff.label}</h3>
                {diff.changes.map(change => (
                  <div
                    key={change.alias}
                    className="flex flex-col gap-0.5 border-l-2 border-solid border-info rounded-xs"
                  >
                    <div className="flex items-center gap-2 py-1 px-2 text-tertiary text-body-3 bg-primary">
                      <IcoMinusSmall16 color="tertiary" />
                      {change.old}
                    </div>
                    <div className="flex items-center gap-2 py-1 px-2 text-info text-label-3 bg-info">
                      <IcoPlusSmall16 color="info" />
                      {change.updated}
                    </div>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
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
