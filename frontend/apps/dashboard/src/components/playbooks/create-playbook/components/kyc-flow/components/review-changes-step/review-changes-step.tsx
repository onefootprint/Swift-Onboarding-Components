import { InlineAlert, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Header from '../../../header';

export type ReviewChangesStepProps = {
  onBack: () => void;
  meta: {
    hasChanges: boolean;
  };
};

const ReviewChangesStep = ({ onBack, meta }: ReviewChangesStepProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.review-changes' });

  return (
    <Stack flexDirection="column" gap={7}>
      {meta.hasChanges ? (
        <div className="flex flex-col gap-2">
          <Header title={t('title')} />
          <InlineAlert variant="warning">{t('warning')}</InlineAlert>
        </div>
      ) : (
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
      )}
    </Stack>
  );
};

export default ReviewChangesStep;
