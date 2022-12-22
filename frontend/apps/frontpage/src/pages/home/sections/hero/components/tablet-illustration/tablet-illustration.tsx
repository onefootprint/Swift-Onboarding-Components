import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const TabletIllustration = () => {
  const { t } = useTranslation('pages.home.hero');
  return (
    <TabletImageWrapper>
      <OuterWrapper>
        <MockupWrapper>
          <Image
            src="/new-home/hero/dashboard.png"
            alt={t('desktop-img-alt')}
            priority
            fill
          />
        </MockupWrapper>
        <Image
          src="/new-home/hero/phone.png"
          height={480}
          width={240}
          alt={t('mobile-img-alt')}
          id="mobile-phone"
          priority
        />
      </OuterWrapper>
    </TabletImageWrapper>
  );
};

const TabletImageWrapper = styled.div`
  display: none;
  position: relative;
  width: 100%;
  height: 500px;
  box-shadow: 0px 12px 70px 12px rgba(225, 222, 251, 0.6);
  overflow: hidden;

  ${media.greaterThan('sm')`
      display: block;
    `}

  ${media.greaterThan('lg')`
      display: none;
    `}
`;

const OuterWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  #mobile-phone {
    transform: translate(50%, 50%);
    position: absolute;
    right: 25%;
    bottom: 20%;
  }
`;

const MockupWrapper = styled.div`
  ${({ theme }) => css`
    height: 100%;
    width: 100%;
    position: relative;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;

    img {
      object-fit: cover;
      object-position: top left;
      min-width: 100%;
    }
  `}
`;
export default TabletIllustration;
