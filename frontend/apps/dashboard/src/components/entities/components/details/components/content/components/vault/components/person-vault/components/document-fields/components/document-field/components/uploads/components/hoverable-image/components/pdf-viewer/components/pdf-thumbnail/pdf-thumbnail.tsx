import { Box } from '@onefootprint/ui';
import React, { useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { useHover } from 'usehooks-ts';

type PdfThumbnailProps = {
  src: string;
  onClick?: () => void;
};

const PdfThumbnail = ({ src, onClick }: PdfThumbnailProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hoverRef = useRef<HTMLDivElement>(null);
  const isHovering = useHover(hoverRef);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = `${src}#page=1&view=FitH&toolbar=0&toolbar=0&navpanes=0&scrollbar=0`;
    }
  }, [src]);

  return (
    <Container ref={hoverRef} tag="button" onClick={onClick}>
      <IframeContainer $isHovering={isHovering}>
        <iframe ref={iframeRef} src={`${src}#toolbar=0&navpanes=0`} title="PDF Thumbnail" />
      </IframeContainer>
    </Container>
  );
};

const Container = styled(Box)`
  ${({ theme }) => css`
    width: 160px;
    height: 200px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    position: relative;
    background-color: ${theme.backgroundColor.secondary};
    transition: all 0.3s ease-in-out;
  `}
`;

const IframeContainer = styled.div<{ $isHovering: boolean }>`
  ${({ theme, $isHovering }) => css`
    position: absolute;
    top: ${$isHovering ? theme.spacing[3] : theme.spacing[4]};
    left: ${$isHovering ? theme.spacing[3] : theme.spacing[4]};
    width: 100%;
    height: 100%;
    border: none;
    background: ${theme.backgroundColor.secondary};
    border-radius: calc(${theme.borderRadius.default} - 2px);
    overflow: hidden;
    box-shadow: ${$isHovering ? theme.elevation[2] : theme.elevation[1]};

    transition:
      top 0.3s ease-in-out,
      left 0.3s ease-in-out,
      box-shadow 0.3s ease-in-out;

    iframe {
      width: 100%;
      height: 100%;
      position: absolute;
      top: -${theme.spacing[1]};
      left: -${theme.spacing[1]};
      transition: all 0.3s ease-in-out;
      pointer-events: none;
    }
  `}
`;

export default PdfThumbnail;
