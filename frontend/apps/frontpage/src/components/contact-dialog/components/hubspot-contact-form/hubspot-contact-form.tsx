import { Box, Stack, Text, media } from '@onefootprint/ui';
import { useToast } from '@onefootprint/ui';
import { AnimatePresence } from 'framer-motion';
import { useHubspotForm } from 'next-hubspot';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LINTRK_CONVERSION_ID } from 'src/config/constants';
import styled, { css } from 'styled-components';

const HubspotContactForm = () => {
  const { t } = useTranslation('common', { keyPrefix: 'components.contact-us-dialog' });
  const [showSuccess, setShowSuccess] = useState(false);
  const toast = useToast();

  const handleFormSubmitted = () => {
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
    onFormSubmitted: handleFormSubmitted,
    onFormError: handleFormError,
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
    <Styles>
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
    </Styles>
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

const Styles = styled(Box)`
  ${({ theme }) => css`
    .hs-form-private, fieldset {
      font-family: ${theme.fontFamily.default};
      font-size: ${theme.typography['body-3'].fontSize};
      font-weight: ${theme.typography['body-3'].fontWeight};
      line-height: ${theme.typography['body-3'].lineHeight};
    }

    .hs-form-field, field {
      color: ${theme.color.primary};
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing[2]};
      margin-bottom: ${theme.spacing[5]};
      width: 100% !important;
    }
      
    .form-columns-2 {
      display: flex;
      flex-direction: column;

      ${media.greaterThan('sm')` 
        flex-direction: row;
        gap: ${theme.spacing[5]};
      `}
    }

    .hs-form-field label, field label {
      font-weight: ${theme.typography['label-3'].fontWeight};      
    }

    .hs-button {
      font-family: ${theme.fontFamily.default};
      font-weight: ${theme.components.button.size.large.typography.fontWeight};
      font-size: ${theme.components.button.size.large.typography.fontSize};
      line-height: ${theme.components.button.size.large.typography.lineHeight};
      color: ${theme.components.button.variant.primary.color};
      background-color: ${theme.components.button.variant.primary.bg};
      border: ${theme.components.button.borderWidth} solid ${theme.components.button.variant.primary.borderColor};
      border-radius: ${theme.components.button.borderRadius};
      cursor: pointer;
      width: fit-content;
      height: ${theme.components.button.size.large.height};
      padding: 0 ${theme.components.button.size.large.paddingHorizontal} !important;
      margin-top: ${theme.spacing[5]};
      box-shadow: ${theme.components.button.variant.primary.boxShadow};
    }

    .hs-button:hover {
      background-color: ${theme.components.button.variant.primary.hover.bg};
    }

    .hs-input {
      width: 100% !important;
      height: ${theme.components.input.size.compact.height};
      font-size: ${theme.components.input.size.compact.typography.fontSize};
      font-weight: ${theme.components.input.size.compact.typography.fontWeight};
      line-height: ${theme.components.input.size.compact.typography.lineHeight};
      border: ${theme.components.input.global.borderWidth} solid ${theme.components.input.state.default.initial.border};
      border-radius: ${theme.components.input.global.borderRadius};
      padding: 0 ${theme.spacing[4]} !important;
    }

    .input {
      margin-right: 0 !important;
    }

    .hs-input:focus, input:focus {
      border: ${theme.components.input.global.borderWidth} solid ${theme.components.input.state.default.focus.border};
    }

    .hs-input:focus-visible, input:focus-visible {
      outline: ${theme.components.input.global.borderWidth} solid ${theme.components.input.state.default.focus.border};
    }

    .hs-input:disabled, input:disabled {
      background-color: ${theme.components.input.state.disabled.bg};
      color: ${theme.components.input.state.disabled.color};
    }

    .hs-input.hs-fieldtype-textarea {
      font-family: ${theme.fontFamily.default};
      font-size: ${theme.typography['body-3'].fontSize};
      font-weight: ${theme.typography['body-3'].fontWeight};
      line-height: ${theme.typography['body-3'].lineHeight};
      min-height: 80px;
      padding: ${theme.spacing[4]} !important;
      width: 100% !important;
    } 

    .hs-error-msg {
      font-family: ${theme.fontFamily.default};
      font-size: ${theme.typography['caption-1'].fontSize};
      font-weight: ${theme.typography['caption-1'].fontWeight};
      line-height: ${theme.typography['caption-1'].lineHeight};
      color: ${theme.components.input.state.error.initial.border};
      margin-top: ${theme.spacing[1]};
    }

    .actions {
      display: flex;
      justify-content: flex-end;
    }
  `}
`;

export default HubspotContactForm;
