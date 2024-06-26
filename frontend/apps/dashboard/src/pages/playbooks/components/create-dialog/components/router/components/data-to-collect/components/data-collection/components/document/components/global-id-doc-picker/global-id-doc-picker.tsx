// @ts-nocheck

import { SupportedIdDocTypes } from '@onefootprint/types';
import { Checkbox, Grid, Text } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const GlobalIdDocPicker = () => {
  const { register } = useFormContext();
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.id-doc',
  });

  return (
    <>
      <Text variant="label-3">{t('sections.global.title')}</Text>
      <Container>
        <Grid.Container gap={3}>
          <Checkbox
            value={SupportedIdDocTypes.driversLicense}
            label={t('drivers_license')}
            {...register('personal.idDocKind')}
          />
          <Checkbox value={SupportedIdDocTypes.idCard} label={t('id_card')} {...register('personal.idDocKind')} />
          <Checkbox value={SupportedIdDocTypes.passport} label={t('passport')} {...register('personal.idDocKind')} />
          <Checkbox
            value={SupportedIdDocTypes.passportCard}
            label={t('passport_card')}
            {...register('personal.idDocKind')}
          />
          <Checkbox value={SupportedIdDocTypes.visa} label={t('visa')} {...register('personal.idDocKind')} />
          <Checkbox
            value={SupportedIdDocTypes.residenceDocument}
            label={t('residence_document')}
            {...register('personal.idDocKind')}
          />
          <Checkbox value={SupportedIdDocTypes.workPermit} label={t('permit')} {...register('personal.idDocKind')} />
          <Checkbox
            value={SupportedIdDocTypes.voterIdentification}
            label={t('voter_identification')}
            {...register('personal.idDocKind')}
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
