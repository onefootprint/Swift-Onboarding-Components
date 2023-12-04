import { useOnClickOutside, useTranslation } from '@onefootprint/hooks';
import { IcoClose16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { media, Overlay, Typography } from '@onefootprint/ui';
import React, { useRef } from 'react';
import ReactPlayer from 'react-player';
import { useLockedBody } from 'usehooks-ts';

type DemoVideoProps = {
  // title: string;
  link: string;
  open: boolean;
  onClose: () => void;
};

const VIDEO_DESKTOP_WIDTH = 600;
const VIDEO_DESKTOP_HEIGHT = 369;

const VIDEO_MOBILE_WIDTH = 350;
const VIDEO_MOBILE_HEIGHT = 215;

const DemoVideo = ({ open, link, onClose }: DemoVideoProps) => {
  useLockedBody(open);
  const { t } = useTranslation('pages.home.hero');
  const videoRef = useRef(null);

  const handleClickOutside = () => {
    onClose();
  };

  useOnClickOutside(videoRef, handleClickOutside);

  return open ? (
    <>
      <ModalContainer role="dialog" aria-label="Footprint Demo Modal">
        <CloseContainer onClick={onClose}>
          <IcoClose16 color="quinary" />
          <Typography color="quinary" variant="label-1" sx={{ marginLeft: 2 }}>
            {t('demo-video-close')}
          </Typography>
        </CloseContainer>
        <VideoContainer ref={videoRef}>
          <ReactPlayer
            url={link}
            controls={false}
            width="100%"
            height="100%"
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1,
                },
              },
            }}
          />
        </VideoContainer>
      </ModalContainer>
      <Overlay aria-modal isVisible={open} />
    </>
  ) : null;
};

const VideoContainer = styled.span`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    width: ${VIDEO_MOBILE_WIDTH}px;
    height: ${VIDEO_MOBILE_HEIGHT}px;

    ${media.greaterThan('md')`
      width: ${VIDEO_DESKTOP_WIDTH}px;
      height: ${VIDEO_DESKTOP_HEIGHT}px;
    `}
  `}
`;

const ModalContainer = styled.div`
  top: 0;
  left: 0;
  position: fixed;
  z-index: 100;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CloseContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: ${theme.spacing[8]};
    right: ${theme.spacing[8]};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    ${theme.spacing[3]} ${theme.spacing[3]};
    background: rgba(255, 255, 255, 0.2);
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    cursor: pointer;
    box-shadow: ${theme.elevation[3]};

    @media (hover: hover) {
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  `}
`;

export default DemoVideo;
