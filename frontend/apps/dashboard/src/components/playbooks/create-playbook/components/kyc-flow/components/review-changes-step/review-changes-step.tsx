import { IcoMinusSmall16, IcoPlusSmall16 } from '@onefootprint/icons';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { InlineAlert, LoadingSpinner, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Header from '../../../header';
import createPayload from '../../utils/create-payload';
import type { StateFormData } from '../../utils/reducer';
import useDiffPlaybooks from './hooks/use-diff-playbooks/use-diff-playbooks';

export type ReviewChangesStepProps = {
  onBack: () => void;
  meta: {
    formData: StateFormData;
    hasChanges: boolean;
    playbook: OnboardingConfiguration;
  };
};

const ReviewChangesStep = ({ onBack, meta }: ReviewChangesStepProps) => {
  return (
    <Stack flexDirection="column" gap={7}>
      {meta.hasChanges ? <WithChanges onBack={onBack} meta={meta} /> : <NoChanges onBack={onBack} />}
    </Stack>
  );
};

const WithChanges = ({ meta: { playbook, formData } }: ReviewChangesStepProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.review-changes' });
  const mutation = useDiffPlaybooks({
    currentPlaybook: playbook,
    newPlaybookPayload: createPayload(formData),
  });

  return (
    <div className="flex flex-col gap-2">
      <Header title={t('title')} />
      <InlineAlert variant="warning" marginBottom={7}>
        {t('warning')}
      </InlineAlert>
      {mutation.isPending && (
        <div className="mt-3 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
      {mutation.data?.length && (
        <ul className="flex flex-col gap-6">
          {mutation.data.map(diff => (
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
