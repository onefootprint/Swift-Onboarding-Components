import { useTranslation } from '@onefootprint/hooks';
import { SupportedIdDocTypes } from '@onefootprint/types';
import { Box, Checkbox, Divider, Grid, Typography } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

type IdDocPickerProps = {
  unselectedIDDoc: boolean;
};

const IdDocPicker = ({ unselectedIDDoc }: IdDocPickerProps) => {
  const { register, watch } = useFormContext();
  const { t } = useTranslation('pages.playbooks.dialog.summary.person');
  const idDocKind = watch('personal.idDocKind');

  return (
    <>
      <Grid.Container gap={3}>
        <Checkbox
          value={SupportedIdDocTypes.driversLicense}
          label={t('id-doc.drivers_license')}
          {...register('personal.idDocKind')}
        />
        <Checkbox
          value={SupportedIdDocTypes.idCard}
          label={t('id-doc.id_card')}
          {...register('personal.idDocKind')}
        />
        <Checkbox
          value={SupportedIdDocTypes.passport}
          label={t('id-doc.passport')}
          {...register('personal.idDocKind')}
        />
        <Checkbox
          value={SupportedIdDocTypes.visa}
          label={t('id-doc.visa')}
          {...register('personal.idDocKind')}
        />
        <Checkbox
          value={SupportedIdDocTypes.residenceDocument}
          label={t('id-doc.residence_document')}
          {...register('personal.idDocKind')}
        />
        <Checkbox
          value={SupportedIdDocTypes.workPermit}
          label={t('id-doc.work_permit')}
          {...register('personal.idDocKind')}
        />
        {(!idDocKind || idDocKind.length === 0) && unselectedIDDoc && (
          <Typography color="error" variant="body-3" sx={{ paddingTop: 5 }}>
            {t('id-doc.no-id-doc-selected')}
          </Typography>
        )}
      </Grid.Container>
      {idDocKind?.length > 0 && (
        <>
          <Box marginTop={5} marginBottom={5}>
            <Divider variant="secondary" />
          </Box>
          <Checkbox
            // @ts-expect-error: fix-me Type 'boolean' is not assignable to type 'string'
            value={false}
            label={t('selfie.label')}
            hint={t('selfie.hint')}
            {...register('personal.selfie')}
          />
        </>
      )}
    </>
  );
};

export default IdDocPicker;
