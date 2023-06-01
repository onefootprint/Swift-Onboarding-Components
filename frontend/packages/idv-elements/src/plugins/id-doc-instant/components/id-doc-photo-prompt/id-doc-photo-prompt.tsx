import { useTranslation } from '@onefootprint/hooks';
import {
  IcoSmartphone24,
  IcoSquareFrame24,
  IcoSun24,
} from '@onefootprint/icons';
import { IdDocType } from '@onefootprint/types';
import React from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';
import InfoBox from '../../../../components/info-box';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import { imageIcons, ImageTypes } from '../../constants/image-types';
import IdDocPhotoButtons from '../id-doc-photo-buttons';

type IdDocPhotoPromptProps = {
  showGuidelines?: boolean;
  type: IdDocType;
  imageType: ImageTypes;
  onComplete: (image: string) => void;
};

const IdDocPhotoPrompt = ({
  showGuidelines,
  onComplete,
  imageType,
  type,
}: IdDocPhotoPromptProps) => {
  const { t } = useTranslation('components.id-doc-photo-prompt');
  const ImageIcon = imageIcons[imageType];
  const side =
    imageType === (type === IdDocType.passport && ImageTypes.front)
      ? 'photo page'
      : `${imageType} side`;

  return (
    <Container>
      <ImageIcon />
      <HeaderTitle
        title={t('title', {
          type: IdDocTypeToLabel[type],
          side,
        })}
      />
      {showGuidelines && (
        <InfoBox
          items={[
            {
              title: t('guidelines.check-lighting.title'),
              description: t('guidelines.check-lighting.description'),
              Icon: IcoSun24,
            },
            {
              title: t('guidelines.device-steady.title'),
              description: t('guidelines.device-steady.description'),
              Icon: IcoSmartphone24,
            },
            {
              title: t('guidelines.whole-document.title'),
              description: t('guidelines.whole-document.description'),
              Icon: IcoSquareFrame24,
            },
          ]}
        />
      )}
      <IdDocPhotoButtons onComplete={onComplete} />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    height: 100%;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;

    > button {
      margin-top: -${theme.spacing[4]};
    }
  `}
`;

export default IdDocPhotoPrompt;
