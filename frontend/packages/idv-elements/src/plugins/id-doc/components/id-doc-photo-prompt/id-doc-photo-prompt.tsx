import { useTranslation } from '@onefootprint/hooks';
import {
  IcoLayer0124,
  IcoSmartphone224,
  IcoSparkles24,
  IcoSquareFrame24,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { CountryCode3, IdDocType } from '@onefootprint/types';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import InfoBox from '../../../../components/info-box';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import { imageIcons, ImageTypes } from '../../constants/image-types';
import FadeInContainer from '../fade-in-container';
import IdDocPhotoButtons from '../id-doc-photo-buttons';

type IdDocPhotoPromptProps = {
  showGuidelines?: boolean;
  type: IdDocType;
  imageType: ImageTypes;
  onComplete: (image: string) => void;
  country: CountryCode3;
};

const IdDocPhotoPrompt = ({
  showGuidelines,
  onComplete,
  imageType,
  type,
  country,
}: IdDocPhotoPromptProps) => {
  const { t } = useTranslation('components.id-doc-photo-prompt');
  const ImageIcon = imageIcons[imageType];
  const side =
    type === IdDocType.passport && ImageTypes.front
      ? 'photo page'
      : `${imageType} side`;

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
                  document: type === IdDocType.passport ? 'passport' : 'ID',
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
        <IdDocPhotoButtons onComplete={onComplete} />
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
