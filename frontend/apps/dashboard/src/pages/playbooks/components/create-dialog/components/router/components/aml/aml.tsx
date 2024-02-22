import { IcoWarning16 } from '@onefootprint/icons';
import {
  Badge,
  Button,
  Checkbox,
  Divider,
  Stack,
  Typography,
} from '@onefootprint/ui';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { AMLFormData } from '@/playbooks/utils/machine/types';

export type AMLProps = {
  defaultValues: AMLFormData;
  isLoading: boolean;
  onBack: () => void;
  onSubmit: (formData: AMLFormData) => void;
};

const AML = ({ defaultValues, isLoading, onBack, onSubmit }: AMLProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.aml',
  });
  const [showError, setShowError] = useState(false);
  const { handleSubmit, register, watch } = useForm<AMLFormData>({
    defaultValues,
  });
  const isAmlChecked = watch('enhancedAml');
  const ofac = watch('ofac');
  const pep = watch('pep');
  const adverseMedia = watch('adverseMedia');
  const isMissingSelection = !!isAmlChecked && !ofac && !pep && !adverseMedia;

  const handleBeforeSubmit = (formData: AMLFormData) => {
    if (isMissingSelection) {
      setShowError(true);
      return;
    }
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
      <Form onSubmit={handleSubmit(handleBeforeSubmit)}>
        <Stack gap={5} direction="column">
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
        </Stack>
        {isMissingSelection && showError && (
          <ErrorContainer>
            <IcoWarning16 color="error" />
            <Typography variant="body-3" color="error">
              {t('missing-selection')}
            </Typography>
          </ErrorContainer>
        )}
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

const ErrorContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]};
  `}
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
