import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { SupportedIdDocTypes } from '@onefootprint/types';
import { Box, Checkbox, Divider, Typography } from '@onefootprint/ui';
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
      <Grid>
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
      </Grid>
      {idDocKind?.length > 0 && (
        <>
          <Box marginTop={5} marginBottom={5}>
            <Divider variant="secondary" />
          </Box>
          <Checkbox
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

const Grid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
  `}
`;

export default IdDocPicker;
