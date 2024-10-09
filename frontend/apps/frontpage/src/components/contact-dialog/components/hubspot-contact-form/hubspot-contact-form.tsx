import { Box, Stack, Text } from '@onefootprint/ui';
import { useToast } from '@onefootprint/ui';
import { createFontStyles } from '@onefootprint/ui';
import { AnimatePresence } from 'framer-motion';
import { useHubspotForm } from 'next-hubspot';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LINTRK_CONVERSION_ID } from 'src/config/constants';
import styled, { css, useTheme } from 'styled-components';

const HubspotContactForm = () => {
  const theme = useTheme();
  const { button } = theme.components;
  const { input } = theme.components;
  const { t } = useTranslation('common', { keyPrefix: 'components.contact-us-dialog' });
  const [showSuccess, setShowSuccess] = useState(false);
  const toast = useToast();

  const handleFormSubmit = () => {
    setShowSuccess(true);
    window.lintrk('track', { conversion_id: LINTRK_CONVERSION_ID });
  };

  const handleFormError = () => {
    toast.show({
      title: t('submit-error.title'),
      description: t('submit-error.description'),
    });
  };

  const { loaded, error, formCreated } = useHubspotForm({
    region: 'na1',
    portalId: '44814407',
    formId: '15f21d51-8890-4792-9477-65f49ca49b77',
    target: '#hubspot-form-wrapper',
    onFormSubmit: handleFormSubmit,
    onFormError: handleFormError,
    css: `
      .hs-form-private, fieldset {
        ${createFontStyles('body-3')};
        margin: ${theme.spacing[3]} 0 0 0 !important;
        align-items: flex-end;
      }

      .hs-form-field, field {
        color: ${theme.color.primary};
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing[2]};
        width: 100%;
      }

      .hs-form-field label, field label {
        margin-bottom: ${theme.spacing[2]};
        ${createFontStyles('label-3')};
      }

      .hs-button {
        ${createFontStyles('label-3')};
        color: ${button.variant.primary.color};
        background-color: ${button.variant.primary.bg};
        border: none;
        border-radius: ${theme.borderRadius.sm};
        cursor: pointer;
        width: fit-content;
        height: ${button.size.large.height};
        padding: ${theme.spacing[3]} ${theme.spacing[5]};
      }

      .hs-button:hover {
        background-color: ${button.variant.primary.hover.bg};
      }

      .hs-input, input {
        width: 100%;
        height: ${input.size.compact.height};
        font-size: ${input.size.compact.typography.fontSize};
        font-weight: ${input.size.compact.typography.fontWeight};
        line-height: ${input.size.compact.typography.lineHeight};
        border: ${input.global.borderWidth} solid ${input.state.default.initial.border};
        border-radius: ${input.global.borderRadius};
      }

      .hs-input:focus, input:focus {
        border: ${input.global.borderWidth} solid ${input.state.default.focus.border};
      }

      .hs-input:focus-visible, input:focus-visible {
        outline: ${input.global.borderWidth} solid ${input.state.default.focus.border};
      }

      .hs-input:disabled, input:disabled {
        background-color: ${input.state.disabled.bg};
        color: ${input.state.disabled.color};
      }

      .hs-input.hs-fieldtype-textarea {
        height: calc(4 * ${input.size.compact.typography.lineHeight} + ${theme.spacing[2]});
        padding: ${theme.spacing[2]};
        resize: vertical;
      }

      .hs-input.hs-fieldtype-textarea legend {
        display: none;
      }

      .hs-error-msg {
        ${createFontStyles('caption-1')};
        color: ${input.state.error.initial.border};
        margin-top: ${theme.spacing[1]};
      }
    `,
  });

  if (error) {
    return <Text variant="body-3">{t('load-error')}</Text>;
  }

  if (!loaded) {
    return <Text variant="body-3">{t('loading')}</Text>;
  }

  if (!formCreated) {
    return <Text variant="body-3">{t('load-error')}</Text>;
  }

  return (
    <Box>
      <AnimatePresence>
        <Stack gap={7} height="100%" flex={1}>
          {showSuccess ? (
            <Stack direction="column" gap={2}>
              <ImageContainer>
                <Image src="/contact-form/penguin-computer.svg" width={500} height={500} alt="Success" />
              </ImageContainer>
              <Text variant="heading-4" textAlign="center" marginTop={5}>
                {t('submit-success.title')}
              </Text>
              <Text variant="body-1" color="secondary" textAlign="center">
                {t('submit-success.description')}
              </Text>
            </Stack>
          ) : (
            <Box width="100%" height="100%" id="hubspot-form-wrapper" />
          )}
        </Stack>
      </AnimatePresence>
    </Box>
  );
};

const ImageContainer = styled(Box)`
  ${({ theme }) => css`
  background-color: ${theme.backgroundColor.secondary};
  width: 100%;
  max-height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  padding: ${theme.spacing[8]} 0 0 0;

  img {
      width: 100%;
      height: 100%;
      object-fit: contain;  
    }
  `}
`;

export default HubspotContactForm;
