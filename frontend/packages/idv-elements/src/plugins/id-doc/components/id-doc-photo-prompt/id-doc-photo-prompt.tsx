import { useTranslation } from '@onefootprint/hooks';
import {
  IcoLayer0124,
  IcoSmartphone224,
  IcoSparkles24,
  IcoSquareFrame24,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  CountryCode3,
  IdDocImageTypes,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React, { useState } from 'react';

import { HeaderTitle } from '../../../../components';
import InfoBox from '../../../../components/info-box';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import { imageIcons } from '../../constants/image-types';
import getImageSideLabel from '../../utils/get-image-side-label';
import FadeInContainer from '../fade-in-container';
import { useIdDocMachine } from '../machine-provider';
import ConsentMobile from './components/consent-mobile';

type IdDocPhotoPromptProps = {
  showGuidelines?: boolean;
  type: SupportedIdDocTypes;
  imageType: IdDocImageTypes;
  country: CountryCode3;
  promptConsent?: boolean;
};

const IdDocPhotoPrompt = ({
  showGuidelines,
  imageType,
  type,
  country,
  promptConsent,
}: IdDocPhotoPromptProps) => {
  const { t } = useTranslation('components.id-doc-photo-prompt');
  const [state, send] = useIdDocMachine();
  const ImageIcon = imageIcons[imageType];
  const { shouldCollectConsent: consentRequired } = state.context.requirement;
  const [consentVisible, setConsentVisible] = useState(false);
  const side = getImageSideLabel(imageType, type);

  const handleClose = () => {
    setConsentVisible(false);
  };

  const handleConsent = () => {
    send({ type: 'consentReceived' });
    setConsentVisible(false);
    send({ type: 'startImageCapture' });
  };

  const handleTake = () => {
    if (consentRequired && promptConsent) {
      setConsentVisible(true);
    } else {
      send({ type: 'startImageCapture' });
    }
  };

  return (
    <FadeInContainer>
      <PromptContainer>
        <ImageIcon />
        <HeaderTitle
          title={t('title', {
            type: IdDocTypeToLabel[type],
            side,
            country,
          })}
        />
        {showGuidelines && (
          <InfoBox
            items={[
              {
                title: t('guidelines.position-document.title', {
                  document: IdDocTypeToLabel[type],
                }),
                description: t('guidelines.position-document.description', {
                  side,
                }),
                Icon: IcoSquareFrame24,
              },
              {
                title: t('guidelines.background.title'),
                description: t('guidelines.background.description'),
                Icon: IcoLayer0124,
              },
              {
                title: t('guidelines.device-steady.title'),
                Icon: IcoSmartphone224,
              },
              {
                title: t('guidelines.autocapture.title'),
                Icon: IcoSparkles24,
              },
            ]}
            variant="default"
          />
        )}
        <Button fullWidth onClick={handleTake}>
          {t('continue')}
        </Button>
        <ConsentMobile
          open={consentVisible}
          onClose={handleClose}
          onConsent={handleConsent}
        />
      </PromptContainer>
    </FadeInContainer>
  );
};

const PromptContainer = styled.div`
  ${({ theme }) => css`
    height: 100%;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;
  `}
`;

export default IdDocPhotoPrompt;
