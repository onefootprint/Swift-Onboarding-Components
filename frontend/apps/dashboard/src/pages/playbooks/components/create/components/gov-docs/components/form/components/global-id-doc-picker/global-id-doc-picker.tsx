import { SupportedIdDocTypes } from '@onefootprint/types';
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
          <Checkbox
            value={SupportedIdDocTypes.driversLicense}
            label={tDocs('drivers_license')}
            {...register('gov.global')}
          />
          <Checkbox value={SupportedIdDocTypes.idCard} label={tDocs('id_card')} {...register('gov.global')} />
          <Checkbox value={SupportedIdDocTypes.passport} label={tDocs('passport')} {...register('gov.global')} />
          <Checkbox
            value={SupportedIdDocTypes.passportCard}
            label={tDocs('passport_card')}
            {...register('gov.global')}
          />
          <Checkbox value={SupportedIdDocTypes.visa} label={tDocs('visa')} {...register('gov.global')} />
          <Checkbox
            value={SupportedIdDocTypes.residenceDocument}
            label={tDocs('residence_document')}
            {...register('gov.global')}
          />
          <Checkbox value={SupportedIdDocTypes.workPermit} label={tDocs('permit')} {...register('gov.global')} />
          <Checkbox
            value={SupportedIdDocTypes.voterIdentification}
            label={tDocs('voter_identification')}
            {...register('gov.global')}
          />
        </Grid.Container>
      </Stack>
    </>
  );
};

export default GlobalIdDocPicker;
