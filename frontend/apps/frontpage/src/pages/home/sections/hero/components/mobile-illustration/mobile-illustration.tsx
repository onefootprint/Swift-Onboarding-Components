import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const MobileIllustration = () => {
  const { t } = useTranslation('pages.home.hero');
  return (
    <Container>
      <Inner>
        <MockupContainer>
          <Image
            src="/home/hero/dashboard.png"
            fill
            alt={t('desktop-img-alt')}
            priority
          />
        </MockupContainer>
        <Image
          src="/home/hero/phone.png"
          height={292.8}
          width={144}
          alt={t('mobile-img-alt')}
          id="mobile-phone"
          priority
        />
      </Inner>
    </Container>
  );
};

const Container = styled.div`
  display: block;
  position: relative;
  width: 100%;
  height: 256px;
  box-shadow: 0px 12px 70px 12px rgba(225, 222, 251, 0.6);

  ${media.greaterThan('sm')`
    display: none;
  `}
`;

const Inner = styled.div`
  ${({ theme }) => css`
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;

    #mobile-phone {
      position: absolute;
      right: 16px;
      bottom: -50%;
    }
  `}
`;

const MockupContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  img {
    object-fit: cover;
    object-position: top left;
    min-width: 100%;
  }
`;
export default MobileIllustration;
