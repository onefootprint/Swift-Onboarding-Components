import { Box, Divider, Radio, Stack, Text, Toggle, Tooltip } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { type VerificationChecksFormData } from 'src/pages/playbooks/utils/machine/types';

export type KybChecksProps = {
  canRunFullKyb: boolean;
};

const KybChecks = ({ canRunFullKyb }: KybChecksProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.verification-checks.kyb-checks' });
  const { register, watch, control } = useFormContext<VerificationChecksFormData>();
  const showKind = Boolean(watch('runKyb'));

  return (
    <Box>
      <Text variant="label-2" color="secondary" marginBottom={5}>
        {t('title')}
      </Text>
      <Controller
        control={control}
        name="runKyb"
        render={({ field }) => (
          <Toggle
            onBlur={field.onBlur}
            onChange={nextValue => {
              field.onChange(nextValue);
            }}
            checked={field.value}
            hint={t('toggle.description')}
            label={t('toggle.label')}
          />
        )}
      />
      {showKind && (
        <Box>
          <Divider variant="secondary" marginBottom={5} marginTop={5} />
          <Stack gap={4} direction="column">
            <Tooltip disabled={canRunFullKyb} text={t('full.disabled')}>
              <Radio disabled={!canRunFullKyb} label={t('full.label')} value="full" {...register('kybKind')} />
            </Tooltip>
            <Radio hint={t('ein.description')} label={t('ein.label')} value="ein" {...register('kybKind')} />
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default KybChecks;
