import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDocRegionality, SupportedIdDocTypes } from '@onefootprint/types';
import {
  Box,
  Checkbox,
  InlineAlert,
  Radio,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import AnimatedContainer from 'src/components/animated-container';

type IdDocFormProps = {
  title: string;
  isPrimary?: boolean;
};

const IdDocForm = ({ title, isPrimary }: IdDocFormProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create.id-doc-form',
  );
  const { register, watch, setValue } = useFormContext();
  const idDocTypes = watch('idDocType');
  const hasDocument = idDocTypes.length > 0;

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked && idDocTypes.length === 1) {
      setValue('selfieRequired', false);
      setValue('regionality', IdDocRegionality.international);
    }
  };

  return (
    <Container data-testid="id-doc-form">
      <SectionTitle>
        <Typography variant={isPrimary ? 'label-2' : 'label-3'}>
          {title}
        </Typography>
      </SectionTitle>
      <OptionsContainer>
        {Object.values(SupportedIdDocTypes).map((type: SupportedIdDocTypes) => (
          <Checkbox
            key={type}
            label={allT(`id_document.${type}`)}
            value={type}
            {...register('idDocType', {
              onChange: handleDocumentChange,
            })}
          />
        ))}
      </OptionsContainer>
      <InlineAlert variant="info">{t('alert-info')}</InlineAlert>
      <AnimatedContainer isExpanded={hasDocument}>
        <DashedDivider />
        <Checkbox
          label={t('selfie.label')}
          hint={t('selfie.hint')}
          {...register('selfieRequired')}
        />
      </AnimatedContainer>
      <AnimatedContainer isExpanded={hasDocument}>
        <DashedDivider />
        <SectionTitle>
          <Typography variant="body-3">{t('regionality.title')}</Typography>
          <Typography variant="body-3" color="tertiary">
            {t('regionality.subtitle')}
          </Typography>
        </SectionTitle>
        <Box sx={{ marginTop: 5 }} />
        <OptionsContainer>
          {Object.values(IdDocRegionality).map(regionality => (
            <Radio
              key={regionality}
              value={regionality}
              label={t(`regionality.values.${regionality}`)}
              {...register('regionality')}
            />
          ))}
        </OptionsContainer>
      </AnimatedContainer>
    </Container>
  );
};

const DashedDivider = styled.div`
  ${({ theme }) => css`
    display: block;
    height: 1px;
    border-top: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
    width: calc(100% - 28px);
    align-self: flex-end;
    margin-bottom: ${theme.spacing[5]};
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const SectionTitle = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `}
`;

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[3]};
  `}
`;

export default IdDocForm;
