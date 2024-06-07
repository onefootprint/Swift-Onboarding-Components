import { IcoCheckSmall16, IcoCloseSmall16, IcoMaximize24, IcoMinimize24 } from '@onefootprint/icons';
import { Stack, useObjectUrl } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import PdfViewer from './components/pdf-viewer';

type HoverableImageProps = {
  base64Data: string;
  isSuccess: boolean;
  documentName: string;
};

const HoverableImage = ({ base64Data, isSuccess, documentName }: HoverableImageProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset.document.drawer.uploads',
  });
  const [isExpanded, setExpanded] = useState(false);

  const handleToggleExpanded = () => {
    setExpanded(!isExpanded);
  };

  const { objectUrl, mimeType } = useObjectUrl(base64Data);

  if (!objectUrl) {
    return <div />;
  }

  return mimeType === 'application/pdf' ? (
    <Stack direction="column" gap={5}>
      <PdfViewer src={objectUrl} documentName={documentName} />
    </Stack>
  ) : (
    <ImageContainer
      animate={{ width: isExpanded ? '100%' : '50%' }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      initial={{ width: '50%' }}
    >
      <StyledImage src={objectUrl} width={0} height={0} alt={t('image-alt')} />
      <>
        <ToggleContainer onClick={handleToggleExpanded} className="toggle">
          {isExpanded ? <IcoMinimize24 color="primary" /> : <IcoMaximize24 color="primary" />}
        </ToggleContainer>
        <HoverImageMask onClick={handleToggleExpanded} />
      </>
      <IconContainer data-success={isSuccess}>
        {isSuccess ? <IcoCheckSmall16 color="quinary" /> : <IcoCloseSmall16 color="quinary" />}
      </IconContainer>
    </ImageContainer>
  );
};

const ImageContainer = styled(motion.div)`
  ${({ theme }) => css`
    position: relative;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

    .toggle {
      opacity: 0;
    }
    :hover {
      .toggle {
        opacity: 1;
      }
    }
  `};
`;

const StyledImage = styled(Image)`
  ${({ theme }) => css`
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: ${theme.borderRadius.default};
  `};
`;

const HoverImageMask = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    border-radius: ${theme.borderRadius.default};
    :hover {
      opacity: 0.4;
    }
  `};
`;

const ToggleContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: calc(50% - 16px);
    left: calc(50% - 16px);
    background-color: ${theme.backgroundColor.primary};
    border: 4px solid ${theme.backgroundColor.primary};
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: ${theme.zIndex.overlay};
    pointer-events: none;
  `};
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    --icon-size: 24px;
    right: calc(var(--icon-size) / 2 * -1);
    top: calc(var(--icon-size) / 2 * -1);
    display: flex;
    height: var(--icon-size);
    width: var(--icon-size);
    justify-content: center;
    align-items: center;
    position: absolute;
    border: 2px solid ${theme.backgroundColor.primary};
    background-color: ${theme.color.error};
    border-radius: 50%;

    &[data-success='true'] {
      background-color: ${theme.color.success};
    }
  `};
`;

export default HoverableImage;
