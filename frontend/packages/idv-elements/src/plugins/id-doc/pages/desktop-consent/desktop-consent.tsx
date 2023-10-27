import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import styled, { css } from '@onefootprint/styled';
import { Button } from '@onefootprint/ui';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import NavigationHeader from '../../../../components/layout/components/navigation-header';
import StickyBottomBox from '../../../../components/layout/components/sticky-bottom-box';
import { LAYOUT_CONTAINER_ID } from '../../../../components/layout/constants';
import Logger from '../../../../utils/logger';
import type { ImageConsentHandler } from '../../components/image-consent';
import ImageConsent from '../../components/image-consent';
import useConsent from '../../hooks/use-consent';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const DesktopConsent = () => {
  const { t } = useTranslation('pages.desktop-consent');
  const [state, send] = useIdDocMachine();
  const { authToken } = state.context;
  const consentMutation = useConsent();
  const requestErrorToast = useRequestErrorToast();
  const consentRef = useRef<ImageConsentHandler>(null);
  const [fullyScrolled, setFullyScrolled] = useState(false);

  const observeBottomIntersection = () => {
    const container = document.getElementById(LAYOUT_CONTAINER_ID);
    const bottom = document.getElementById('consent-bottom');
    if (!container || !bottom) return;
    const intersectionObserver = new IntersectionObserver(
      entries =>
        entries.forEach(entry => {
          if (entry.isIntersecting) setFullyScrolled(true);
        }),
      {
        root: container,
      },
    );
    intersectionObserver.observe(bottom);
  };

  useEffect(() => {
    observeBottomIntersection();
  }, []);

  useLayoutEffect(() => {
    const layoutContainer = document.getElementById(LAYOUT_CONTAINER_ID);
    if (layoutContainer?.scrollTo) layoutContainer.scrollTo(0, 0);
  }, []);

  const submitConsent = () => {
    const consentInfo = consentRef.current?.getConsentInfo();
    if (!authToken || consentMutation.isLoading || !consentInfo) {
      if (!authToken) {
        Logger.error(
          "Could not submit consent - auth token doesn't exist",
          'consent-desktop',
        );
      }
      if (!consentInfo) {
        Logger.error(
          'Could not submit consent - consent language is empty or undefined',
          'consent-desktop',
        );
      }
      return;
    }

    const { consentLanguageText, mlConsent } = consentInfo;

    consentMutation.mutate(
      { consentLanguageText, mlConsent, authToken },
      {
        onSuccess: () => {
          send({
            type: 'consentReceived',
          });
        },
        onError: err => {
          Logger.error(
            `Could not submit consent language. Error: ${getErrorMessage(err)}`,
            'consent-desktop',
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

  return (
    <>
      <NavigationHeader
        leftButton={{ variant: 'back', onBack: handleClickBack }}
      />
      <ConsentBody aria-label="consent-body">
        <ImageConsent ref={consentRef} />
      </ConsentBody>
      <div id="consent-bottom" />
      <StickyBottomBox>
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
      </StickyBottomBox>
    </>
  );
};

const ConsentBody = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} ${theme.spacing[3]}
      calc(-1 * ${theme.spacing[3]});
  `}
`;

export default DesktopConsent;
