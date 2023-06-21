import { useTranslation } from '@onefootprint/hooks';
import { IcoClose24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { media, Overlay, Typography } from '@onefootprint/ui';
import React from 'react';
import { useLockedBody } from 'usehooks-ts';

type DemoVideoProps = {
  title: string;
  link: string;
  open: boolean;
  onClose: () => void;
};

const DemoVideo = ({ open, title, link, onClose }: DemoVideoProps) => {
  useLockedBody(open);
  const { t } = useTranslation('pages.home.hero');

  return open ? (
    <>
      <ModalContainer role="dialog" aria-label="Footprint Demo Modal">
        <CloseContainer onClick={onClose}>
          <IcoClose24 color="quinary" />
          <Typography color="quinary" variant="label-2" sx={{ marginLeft: 2 }}>
            {t('demo-video-close')}
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
      <Overlay aria-modal isVisible={open} />
    </>
  ) : null;
};

const ModalContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    z-index: 100;
    top: ${theme.spacing[10]};
    left: 5%;
    width: 90%;
    padding-top: 50.625%;
    /* Preserves 16:9 Aspect Ratio */
  `}
`;

const CloseContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(0, -100%);
    padding: ${theme.spacing[3]};
    margin-right: -${theme.spacing[3]};
    cursor: pointer;

    @media (hover: hover) {
      &:hover {
        text-decoration: underline;
        color: ${theme.color.quinary};
      }
    }
  `}
`;

const StyledIFrame = styled.iframe`
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 100%;

  ${media.greaterThan('xl')`
     transform: translate(-50%, -50%);
      width: 50%;
      height: 50%;
      top: 50%;
      left: 50%;
  `}
`;

export default DemoVideo;
