import { SupportedIdDocTypes } from '@onefootprint/types';
import { Checkbox, Grid, Text } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const GlobalIdDocPicker = () => {
  const { register } = useFormContext();
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.gov-docs.global',
  });
  const { t: tDocs } = useTranslation('common', { keyPrefix: 'id_document' });

  return (
    <>
      <Text variant="label-3">{t('title')}</Text>
      <Container>
        <Grid.Container gap={3}>
          <Checkbox
            value={SupportedIdDocTypes.driversLicense}
            label={tDocs('drivers_license')}
            {...register('personal.docs.global')}
          />
          <Checkbox value={SupportedIdDocTypes.idCard} label={tDocs('id_card')} {...register('personal.docs.global')} />
          <Checkbox
            value={SupportedIdDocTypes.passport}
            label={tDocs('passport')}
            {...register('personal.docs.global')}
          />
          <Checkbox
            value={SupportedIdDocTypes.passportCard}
            label={tDocs('passport_card')}
            {...register('personal.docs.global')}
          />
          <Checkbox value={SupportedIdDocTypes.visa} label={tDocs('visa')} {...register('personal.docs.global')} />
          <Checkbox
            value={SupportedIdDocTypes.residenceDocument}
            label={tDocs('residence_document')}
            {...register('personal.docs.global')}
          />
          <Checkbox
            value={SupportedIdDocTypes.workPermit}
            label={tDocs('permit')}
            {...register('personal.docs.global')}
          />
          <Checkbox
            value={SupportedIdDocTypes.voterIdentification}
            label={tDocs('voter_identification')}
            {...register('personal.docs.global')}
          />
        </Grid.Container>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding-left: ${theme.spacing[5]};
  `};
`;

export default GlobalIdDocPicker;
