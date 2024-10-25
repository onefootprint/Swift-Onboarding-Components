import useEntity from '@/entity/hooks/use-entity';
import useEntityId from '@/entity/hooks/use-entity-id';
import { OnboardingConfigKind } from '@onefootprint/types';
import { mostRecentWorkflow } from '@onefootprint/types/src/data/entity';
import { Box, Select, Shimmer } from '@onefootprint/ui';
import { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import usePlaybookOptions from 'src/hooks/use-playbook-options';

const RequestOnboard = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'actions.request-more-info.form.onboard',
  });
  const { control, watch, setValue } = useFormContext();
  const selectedPlaybook = watch('playbook');
  const { data: playbooksData } = usePlaybookOptions({
    kinds: [OnboardingConfigKind.document, OnboardingConfigKind.kyb, OnboardingConfigKind.kyc],
  });
  const entityId = useEntityId();
  const entity = useEntity(entityId);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Once the playbooks load, select the playbook the user last onboarded onto as the default
    // selected option
    const defaultPlaybookId = entity.data?.workflows.sort(mostRecentWorkflow)[0]?.playbookId;
    const defaultPlaybookValue = playbooksData?.find(p => p.value === defaultPlaybookId);
    if (!defaultPlaybookValue || !defaultPlaybookId || selectedPlaybook) {
      setIsLoading(false);
      return;
    }
    setValue('playbook', defaultPlaybookValue);
    setIsLoading(false);
  }, [playbooksData, selectedPlaybook, setValue, entity]);

  if (isLoading || !playbooksData?.length) {
    return (
      <Box marginBottom={5}>
        <Shimmer height="48px" width="100%" />
      </Box>
    );
  }

  return (
    <Controller
      control={control}
      name="playbook"
      render={select => (
        <Select
          label={t('use-playbook')}
          hasError={!!select.fieldState.error}
          hint={select.fieldState.error && t('playbook-required')}
          placeholder={t('select-a-playbook')}
          onBlur={select.field.onBlur}
          onChange={select.field.onChange}
          options={playbooksData}
          value={select.field.value}
        />
      )}
    />
  );
};

export default RequestOnboard;
