import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import type { AMLFormData } from '@/playbooks/utils/machine/types';

export type AMLProps = {
  defaultValues: AMLFormData;
  isLoading: boolean;
  onBack: () => void;
  onSubmit: (formData: AMLFormData) => void;
};

const AML = ({ defaultValues, isLoading, onBack, onSubmit }: AMLProps) => {
  const { t, allT } = useTranslation('pages.playbooks.dialog.aml');
  const { handleSubmit, register, watch } = useForm<AMLFormData>({
    defaultValues,
  });
  const isAmlChecked = watch('enhancedAml');

  const submit = (formData: AMLFormData) => {
    onSubmit(formData);
  };

  return (
    <Container>
      <Header>
        <TitleContainer>
          <Typography variant="label-1" color="secondary">
            {t('title')}
          </Typography>
          <Badge variant="info">{t('recommended')}</Badge>
        </TitleContainer>
        <Typography variant="body-2" color="secondary">
          {t('subtitle')}
        </Typography>
      </Header>
      <Form onSubmit={handleSubmit(submit)}>
        <Box sx={{ gap: 5, display: 'flex', flexDirection: 'column' }}>
          <Checkbox
            label={t('aml.label')}
            hint={t('aml.hint')}
            {...register('enhancedAml')}
          />
          {isAmlChecked && (
            <>
              <Divider variant="secondary" />
              <Checkbox
                label={t('ofac.label')}
                hint={t('ofac.hint')}
                {...register('ofac')}
              />
              <Checkbox
                label={t('pep.label')}
                hint={t('pep.hint')}
                {...register('pep')}
              />
              <Checkbox
                label={t('adverse-media.label')}
                hint={t('adverse-media.hint')}
                {...register('adverseMedia')}
              />
              <Divider variant="secondary" />
              <Typography variant="body-3" color="tertiary">
                <Typography variant="body-3" color="primary" as="span">
                  {t('footer.label')}{' '}
                </Typography>
                {t('footer.content')}
              </Typography>
            </>
          )}
        </Box>
        <ButtonContainer>
          <Button
            disabled={isLoading}
            onClick={onBack}
            size="compact"
            variant="secondary"
          >
            {allT('back')}
          </Button>
          <Button
            loading={isLoading}
            size="compact"
            type="submit"
            variant="primary"
          >
            {allT('create')}
          </Button>
        </ButtonContainer>
      </Form>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    width: 520px;
    white-space: pre-wrap;
  `};
`;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
    padding-top: ${theme.spacing[5]};
  `};
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[3]};
  `};
`;

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
  `}
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default AML;
