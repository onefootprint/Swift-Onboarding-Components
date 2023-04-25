import { useTranslation } from '@onefootprint/hooks';
import { IcoFootprint40 } from '@onefootprint/icons';
import { media, Typography } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const TabletIllustration = () => {
  const { t } = useTranslation('pages.home.vault-proxy');
  return (
    <Container>
      <LabelLeft>
        <Typography as="p" variant="label-2" color="quinary">
          {t('illustration.your-app')}
        </Typography>
      </LabelLeft>
      <Knob>
        <StyledFootprintIcon color="septenary" />
        <OuterBorder
          src="/home/vault-proxy/tokens/knob-outer.svg"
          height={156}
          width={156}
          alt="decorative"
        />
        <Lines
          src="/home/vault-proxy/tokens/knob-lines.svg"
          height={124}
          width={124}
          alt="decorative"
          animate={{
            rotate: [0, 32, 24, -48, -32, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'mirror',
          }}
        />
        <Top
          src="/home/vault-proxy/tokens/knob-top.svg"
          height={108}
          width={108}
          alt="decorative"
        />
      </Knob>
      <Values>
        <Image
          src="/home/vault-proxy/tokens/values.svg"
          height={240}
          width={240}
          alt="decorative"
        />
      </Values>
      <LabelRight>
        <Typography as="p" variant="label-2" color="quinary">
          {t('illustration.third-party')}
        </Typography>
      </LabelRight>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: none;
    position: relative;

    ${media.greaterThan('md')`
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 240px;
        padding-bottom: ${theme.spacing[12]};
        margin-top: ${theme.spacing[9]};
    `}

    ${media.greaterThan('lg')`
        display: none;
    `}
  `}
`;

const Knob = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 50%;
  width: fit-content;
  isolation: isolate;

  img {
    position: absolute;
  }
`;

const OuterBorder = styled(Image)`
  z-index: 1;
`;

const Lines = styled(motion.img)`
  z-index: 2;
`;

const Top = styled(Image)`
  z-index: 3;
`;

const StyledFootprintIcon = styled(IcoFootprint40)`
  z-index: 4;
`;

const Values = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;

  img {
    width: 100%;
  }
`;

const LabelLeft = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: calc(-1 * ${theme.spacing[9]});
    left: 0;
    opacity: 0.5;
  `}
`;

const LabelRight = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: calc(-1 * ${theme.spacing[9]});
    right: 0;
    opacity: 0.5;
  `}
`;

export default TabletIllustration;
