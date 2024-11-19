import { Checkbox, Grid, Stack, Text } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { GovDocsFormData } from '../../../../gov-docs.types';

const GlobalIdDocPicker = () => {
  const { register } = useFormContext<GovDocsFormData>();
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.gov-docs.global',
  });
  const { t: tDocs } = useTranslation('common', { keyPrefix: 'id_document' });

  return (
    <>
      <Text variant="label-3">{t('title')}</Text>
      <Stack direction="column">
        <Grid.Container gap={3}>
          <Checkbox value="drivers_license" label={tDocs('drivers_license')} {...register('gov.global')} />
          <Checkbox value={'id_card'} label={tDocs('id_card')} {...register('gov.global')} />
          <Checkbox value={'passport'} label={tDocs('passport')} {...register('gov.global')} />
          <Checkbox value={'passport_card'} label={tDocs('passport_card')} {...register('gov.global')} />
          <Checkbox value={'visa'} label={tDocs('visa')} {...register('gov.global')} />
          <Checkbox value={'residence_document'} label={tDocs('residence_document')} {...register('gov.global')} />
          <Checkbox value={'permit'} label={tDocs('permit')} {...register('gov.global')} />
          <Checkbox value={'voter_identification'} label={tDocs('voter_identification')} {...register('gov.global')} />
        </Grid.Container>
      </Stack>
    </>
  );
};

export default GlobalIdDocPicker;
