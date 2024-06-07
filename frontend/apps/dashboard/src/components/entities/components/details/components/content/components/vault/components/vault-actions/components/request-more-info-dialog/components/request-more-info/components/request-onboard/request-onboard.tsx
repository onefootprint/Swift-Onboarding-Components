import { OnboardingConfigKind } from '@onefootprint/types';
import { mostRecentWorkflow } from '@onefootprint/types/src/data/entity';
import { Select, Shimmer } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AnimatedContainer from 'src/components/animated-container';
import useEntity from 'src/components/entities/components/details/hooks/use-entity';
import useEntityId from 'src/components/entities/components/details/hooks/use-entity-id';
import usePlaybookOptions from 'src/pages/home/hooks/use-playbook-options';

type RequestOnboardProps = {
  visible: boolean;
};

const RequestOnboard = ({ visible }: RequestOnboardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.request-more-info.form.onboard',
  });
  const { control, watch, setValue } = useFormContext();
  const selectedPlaybook = watch('playbook');
  const { data: playbooksData } = usePlaybookOptions({
    kinds: [OnboardingConfigKind.document, OnboardingConfigKind.kyb, OnboardingConfigKind.kyc],
  });
  const entityId = useEntityId();
  const entity = useEntity(entityId);

  useEffect(() => {
    // Once the playbooks load, select the playbook the user last onboarded onto as the default
    // selected option
    const defaultPlaybookId = entity.data?.workflows.sort(mostRecentWorkflow)[0]?.playbookId;
    const defaultPlaybookValue = playbooksData?.find(p => p.value === defaultPlaybookId);
    if (!defaultPlaybookValue || !defaultPlaybookId || selectedPlaybook) {
      return;
    }
    setValue('playbook', defaultPlaybookValue);
  }, [playbooksData, selectedPlaybook, setValue, entity]);

  return (
    <AnimatedContainer isExpanded={visible}>
      {playbooksData?.length ? (
        <Controller
          control={control}
          name="playbook"
          rules={{
            required: visible,
          }}
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
      ) : (
        <Shimmer height="38px" width="100%" />
      )}
    </AnimatedContainer>
  );
};

export default RequestOnboard;
