import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import styled, { css } from '@onefootprint/styled';
import { Button, Divider } from '@onefootprint/ui';
import React, { useRef, useState } from 'react';

import { NavigationHeader } from '../../../../components';
import ImageConsent, {
  ImageConsentHandler,
} from '../../components/image-consent';
import useConsent from '../../hooks/use-consent';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const DEFAULT_CONTENT_HEIGHT = 400;
const SCROLL_OFFSET = 10; // We enable the button is the user scrolled with the 10px of the bottom of the content

const DesktopConsent = () => {
  const { t } = useTranslation('pages.desktop-consent');
  const [state, send] = useIdDocMachine();
  const { authToken } = state.context;
  const consentMutation = useConsent();
  const requestErrorToast = useRequestErrorToast();
  const consentRef = useRef<ImageConsentHandler>(null);
  const [fullyScrolled, setFullyScrolled] = useState(false);

  const submitConsent = () => {
    const consentLanguageText = consentRef.current?.getConsentText();
    if (!authToken || consentMutation.isLoading || !consentLanguageText) {
      if (!authToken)
        console.error("Could not submit consent - auth token doesn't exist");
      if (!consentLanguageText)
        console.error(
          'Could not submit consent - consent language is empty or undefined',
        );
      return;
    }

    consentMutation.mutate(
      { consentLanguageText, authToken },
      {
        onSuccess: () => {
          send({
            type: 'consentReceived',
          });
        },
        onError: err => {
          console.error(
            `Could not submit consent language. Error: ${getErrorMessage(err)}`,
          );
          requestErrorToast(err);
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const handleClickBack = () => {
    send({
      type: 'navigatedToPrev',
    });
  };

  const CONTENT_HEIGHT = Math.min(
    DEFAULT_CONTENT_HEIGHT,
    (window?.innerHeight ?? 0) * 0.6,
  ); // If the window height is smaller than 540px, we will use 80% of the window height

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const isBottom =
      target.scrollHeight - target.scrollTop <=
      target.clientHeight + SCROLL_OFFSET; // 10px allowed offset
    if (!fullyScrolled) setFullyScrolled(isBottom);
  };

  return (
    <Container>
      <NavigationHeader button={{ variant: 'back', onBack: handleClickBack }} />
      <ConsentBody
        onScroll={handleScroll}
        height={CONTENT_HEIGHT}
        aria-label="consent-body"
      >
        <ImageConsent ref={consentRef} />
      </ConsentBody>
      <Divider />
      <SubmitButtonContainer>
        <Button
          fullWidth
          onClick={submitConsent}
          loading={consentMutation.isLoading}
          disabled={!fullyScrolled}
          testID="consent-button"
        >
          {fullyScrolled
            ? t('submit-button.enabled-title')
            : t('submit-button.disabled-title')}
        </Button>
      </SubmitButtonContainer>
    </Container>
  );
};

const Container = styled.div``;

const ConsentBody = styled.div<{ height: number }>`
  ${({ theme, height }) => css`
    padding: ${theme.spacing[5]};
    height: ${height}px;
    overflow-y: auto;
  `}
`;

const SubmitButtonContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    margin-top: ${theme.spacing[5]};
    margin-left: ${theme.spacing[5]};
    margin-right: ${theme.spacing[5]};
  `}
`;

export default DesktopConsent;
