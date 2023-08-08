import { IcoClose32 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Typography,
} from '@onefootprint/ui';
import React, { useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';

import useTranslation from '@/hooks/use-translation';

import useConsent from './hooks/use-consent';

export type ConsentDialogProps = {
  authToken: string;
  onCompleted: () => void;
};

const HEADER_HEIGHT = 56;
const SHOW_HEADER_THRESHOLD = 30;
const SHOW_CTA_THRESHOLD = 700;

const ConsentDialog = ({ authToken, onCompleted }: ConsentDialogProps) => {
  const { t } = useTranslation('components.scan.selfie.consent');
  const consentMutation = useConsent();
  const [open, setOpen] = useState(true);
  const [isThirdPartyConsented, setIsThirdPartyConsented] = useState(false);
  const [hasReadConsent, setHasReadConsent] = useState(false);
  const [showSheetHeader, setShowSheetHeader] = useState(false);

  const handleThirdParty = () => {
    setIsThirdPartyConsented(previousValue => !previousValue);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setHasReadConsent(
      e.nativeEvent.contentOffset.y >
        e.nativeEvent.contentSize.height - SHOW_CTA_THRESHOLD,
    );
    setShowSheetHeader(e.nativeEvent.contentOffset.y > SHOW_HEADER_THRESHOLD);
  };

  const getConsentLanguageText = () => {
    const consentLanguages = [t('subtitle'), t('description')];
    if (isThirdPartyConsented) {
      consentLanguages.push(t('third-party'));
    }
    consentLanguages.push(t('cta'));
    return consentLanguages.join('. ');
  };

  const handleSubmit = () => {
    if (!authToken || consentMutation.isLoading) {
      return;
    }
    const consentLanguageText = getConsentLanguageText();
    consentMutation.mutate(
      { consentLanguageText, authToken },
      {
        onSuccess: () => {
          setOpen(false);
          onCompleted();
        },
      },
    );
  };

  return (
    <StyledModal
      visible={open}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="formSheet"
    >
      <Box height={HEADER_HEIGHT}>
        <Typography variant="label-2" center paddingBottom={5} paddingTop={5}>
          {showSheetHeader ? t('title') : ''}
        </Typography>
        <Box position="absolute" right={12} top={12}>
          <IconButton aria-label="Close" onPress={onClose}>
            <IcoClose32 />
          </IconButton>
        </Box>
      </Box>

      <Box
        marginHorizontal={5}
        gap={3}
        marginBottom={6}
        paddingBottom={8}
        flex={1}
      >
        <ScrollView onScroll={onScroll} scrollEventThrottle={25}>
          <Box marginBottom={3}>
            <Typography variant="heading-3" center>
              {t('title')}
            </Typography>
          </Box>
          <Typography variant="label-4" center>
            {t('subtitle')}
          </Typography>
          <Box marginTop={5}>
            <Typography variant="body-3">{t('description')}</Typography>
            <Box
              backgroundColor="secondary"
              borderRadius="default"
              flexDirection="row"
              padding={5}
            >
              <Checkbox
                label={t('third-party')}
                onValueChange={handleThirdParty}
                value={isThirdPartyConsented}
              />
            </Box>
          </Box>
        </ScrollView>
        <Button
          disabled={!hasReadConsent}
          onPress={handleSubmit}
          marginTop={7}
          loading={consentMutation.isLoading}
        >
          {hasReadConsent ? t('agree-and-continue') : t('scroll-to-agree')}
        </Button>
      </Box>
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  ${({ theme }) => css`
    justify-content: flex-end;
    margin-bottom: ${theme.spacing[8]};
    margin-horizontal: ${theme.spacing[3]};
    height: 100%;
    flex: 1;
  `}
`;

export default ConsentDialog;
