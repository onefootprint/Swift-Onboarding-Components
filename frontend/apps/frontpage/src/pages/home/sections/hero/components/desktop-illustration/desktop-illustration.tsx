import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

import LineDraw from '../../../../components/line/line';

const wrapper = {
  visible: {
    transition: {
      delayChildren: 0.5,
      staggerChildren: 0.5,
    },
  },
};

const line = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
};

const phone = {
  hidden: {
    opacity: 0,
    y: -300,
    x: 900,
  },
  visible: {
    opacity: 1,
    y: -500,
    x: 900,
  },
};

const mockup = {
  hidden: { opacity: 0, y: 10, x: 0 },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      delayChildren: 0.2,
    },
  },
};

const DesktopIllustration = () => {
  const { t } = useTranslation('pages.home.hero');
  return (
    <Container
      as={motion.div}
      variants={wrapper}
      initial="hidden"
      animate="visible"
    >
      <OuterMockupContainer>
        <MockupContainer as={motion.div} variants={mockup} key={2}>
          <Image
            src="/home/hero/dashboard.png"
            height={820}
            width={1440}
            alt={t('desktop-img-alt')}
            priority
          />
        </MockupContainer>
      </OuterMockupContainer>
      <PhoneContainer as={motion.div} variants={phone} key={3}>
        <Image
          src="/home/hero/phone.png"
          height={575}
          width={284}
          alt={t('mobile-img-alt')}
          id="mobile-phone"
          priority
        />
      </PhoneContainer>
      <LineDraw
        height={0.2}
        width={100}
        color="#4A24DB"
        top={0}
        left={36}
        as={motion.div}
        variants={line}
        key={4}
      />
      <LineDraw
        height={100}
        width={0.2}
        color="#4A24DB"
        top={36}
        left={0}
        as={motion.div}
        variants={line}
        key={5}
      />
      <LineDraw
        height={0.2}
        width={100}
        color="#4A24DB"
        top={101}
        left={50}
        as={motion.div}
        variants={line}
        key={6}
      />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    position: relative;
    display: none;
    border-radius: ${theme.borderRadius.large};

    ${media.greaterThan('lg')`
      display: block;
      height: 820px;
      padding: ${theme.spacing[2]};
    `}
  `}
`;

const PhoneContainer = styled.div`
  position: relative;
  z-index: 2;
  width: fit-content;
  will-change: opacity, transform;
`;

const OuterMockupContainer = styled.div`
  ${({ theme }) => css`
    position: relative;
    width: 100%;
    height: 100%;
    padding: ${theme.spacing[3]};
    padding-bottom: 0;
  `}
`;

const MockupContainer = styled.div`
  ${({ theme }) => css`
    height: 100%;
    width: 100%;
    position: relative;
    will-change: opacity, transform;
    box-shadow: 0px 12px 70px 12px rgba(225, 222, 251, 0.6);
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;

    img {
      object-fit: cover;
      object-position: top left;
      width: 100%;
    }
  `}
`;

export default DesktopIllustration;
