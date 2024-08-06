import { SupportedIdDocTypes } from '@onefootprint/types';
import { Checkbox, Grid, Stack, Text } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const GlobalIdDocPicker = () => {
  const { register } = useFormContext();
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
            {...register('person.docs.gov.global')}
          />
          <Checkbox
            value={SupportedIdDocTypes.idCard}
            label={tDocs('id_card')}
            {...register('person.docs.gov.global')}
          />
          <Checkbox
            value={SupportedIdDocTypes.passport}
            label={tDocs('passport')}
            {...register('person.docs.gov.global')}
          />
          <Checkbox
            value={SupportedIdDocTypes.passportCard}
            label={tDocs('passport_card')}
            {...register('person.docs.gov.global')}
          />
          <Checkbox value={SupportedIdDocTypes.visa} label={tDocs('visa')} {...register('person.docs.gov.global')} />
          <Checkbox
            value={SupportedIdDocTypes.residenceDocument}
            label={tDocs('residence_document')}
            {...register('person.docs.gov.global')}
          />
          <Checkbox
            value={SupportedIdDocTypes.workPermit}
            label={tDocs('permit')}
            {...register('person.docs.gov.global')}
          />
          <Checkbox
            value={SupportedIdDocTypes.voterIdentification}
            label={tDocs('voter_identification')}
            {...register('person.docs.gov.global')}
          />
        </Grid.Container>
      </Stack>
    </>
  );
};

export default GlobalIdDocPicker;
