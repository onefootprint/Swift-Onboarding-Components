import IcoClose24 from 'icons/ico/ico-close-24';
import React from 'react';
import { useLockBodyScroll } from 'react-use';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';
import Overlay from 'ui/src/components/internal/overlay/overlay';

type DemoVideoProps = {
  title: string;
  link: string;
  open: boolean;
  onClose: () => void;
};

const DemoVideo = ({ open, title, link, onClose }: DemoVideoProps) => {
  useLockBodyScroll(open);

  return open ? (
    <Overlay onClick={onClose} aria-modal>
      <ModalContainer role="dialog" aria-label="Footprint Demo Modal">
        <CloseContainer onClick={onClose}>
          <IcoClose24 color="quinary" />{' '}
          <Typography color="quinary" variant="label-2" sx={{ marginLeft: 2 }}>
            Close
          </Typography>
        </CloseContainer>
        <StyledIFrame
          src={link}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </ModalContainer>
    </Overlay>
  ) : null;
};

const ModalContainer = styled.div`
  position: relative;
  width: 90%; /* Leave some space at the edges of the modal */
  padding-top: 50.625%; /* Preserves 16:9 Aspect Ratio */
`;

const CloseContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(0, -100%);
    padding: ${theme.spacing[3]}px;
    margin-right: -${theme.spacing[3]}px;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
      color: ${theme.color.quinary};
    }
  `}
`;

const StyledIFrame = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
`;

export default DemoVideo;
