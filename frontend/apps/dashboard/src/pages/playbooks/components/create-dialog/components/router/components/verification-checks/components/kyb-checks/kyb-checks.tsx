import { Radio, Stack, Text, Tooltip } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type VerificationChecksFormData } from 'src/pages/playbooks/utils/machine/types';

export type KybChecksProps = {
  canRunFullKyb: boolean;
};

const KybChecks = ({ canRunFullKyb }: KybChecksProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.kyb-checks' });
  const { register } = useFormContext<VerificationChecksFormData>();

  return (
    <Stack gap={5} direction="column">
      <Text variant="label-2" color="secondary">
        {t('title')}
      </Text>
      <Stack gap={4} direction="column">
        <Tooltip disabled={canRunFullKyb} text={t('full.disabled')}>
          <Radio
            disabled={!canRunFullKyb}
            label={t('full.label')}
            value="full"
            {...register('kybKind')}
          />
        </Tooltip>
        <Radio
          hint={t('ein.description')}
          label={t('ein.label')}
          value="ein"
          {...register('kybKind')}
        />
      </Stack>
    </Stack>
  );
};

export default KybChecks;
