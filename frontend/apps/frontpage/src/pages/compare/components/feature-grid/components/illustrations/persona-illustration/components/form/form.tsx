import { Box, Stack, Text, TextInput, createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type FormProps = {
  $borderRadius: string;
  $backgroundColor: string;
  className?: string;
};

const Form = ({ $borderRadius, $backgroundColor, className }: FormProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.customize.components.screen',
  });

  return (
    <FormContainer className={className}>
      <Stack direction="column" gap={3} width="100%">
        <Text variant="label-3">{t('title')}</Text>
        <Text variant="body-4" color="secondary">
          {t('subtitle')}
        </Text>
      </Stack>
      <FieldsContainer>
        <Box position="relative" width="100%">
          <StyledTextInput type="text" label={t('first-name')} placeholder="Jane" $borderRadius={$borderRadius} />
        </Box>
        <Box position="relative" width="100%">
          <StyledTextInput type="text" label={t('last-name')} placeholder="Doe" $borderRadius={$borderRadius} />
        </Box>
        <Box position="relative" width="100%">
          <TextInput
            type="text"
            label={t('date-of-birth')}
            mask={{
              date: true,
              delimiter: '/',
              datePattern: ['m', 'd', 'Y'],
            }}
            placeholder="MM/DD/YYYY"
          />
        </Box>
        <StyledButton $borderRadius={$borderRadius} $backgroundColor={$backgroundColor}>
          {t('cta')}
        </StyledButton>
      </FieldsContainer>
    </FormContainer>
  );
};

const FormContainer = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing[7]};
    background-color: ${theme.backgroundColor.primary};
    gap: ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.lg};
    width: 320px;
    position: absolute;
    bottom: ${theme.spacing[7]};
    left: 50%;
    transform: translateX(-50%);
    z-index: 0;
    box-shadow: ${theme.elevation[1]};
  `}
`;

const FieldsContainer = styled(Stack)`
  ${({ theme }) => css`
    width: 100%;
    flex-direction: column;
    gap: ${theme.spacing[6]};
    position: relative;
  `}
`;

const StyledButton = styled.button<FormProps>`
  ${({ theme, $borderRadius, $backgroundColor }) => css`
    all: unset;
    ${createFontStyles('label-3')}
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${theme.color.quinary};
    padding: ${theme.spacing[3]};
    flex: 1;
    border-radius: ${$borderRadius}px;
    background-color: ${$backgroundColor};
    margin-top: ${theme.spacing[5]};
  `}
`;

const StyledTextInput = styled(TextInput)<{ $borderRadius: string }>`
  ${({ $borderRadius }) => css`
    border-radius: ${$borderRadius}px;
  `}
`;

export default Form;
