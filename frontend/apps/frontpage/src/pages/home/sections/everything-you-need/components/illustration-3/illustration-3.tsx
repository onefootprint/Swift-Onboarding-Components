import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

const Illustration3 = () => {
  const { t } = useTranslation('pages.home.everything-you-need-section');
  return (
    <>
      <IllustrationContainer data-viewport="desktop">
        <Image
          src="/new-home/everything-you-need-section/feature-3/scan-id.png"
          alt={t('features.feature-3.alt-1')}
          height={547}
          width={269}
          data-type="phone-left"
        />
        <Image
          src="/new-home/everything-you-need-section/feature-3/submit-drivers-license.png"
          alt={t('features.feature-3.alt-2')}
          height={547}
          width={269}
          data-type="phone-right"
        />
      </IllustrationContainer>
      <IllustrationContainer data-viewport="tablet">
        <Image
          src="/new-home/everything-you-need-section/feature-3/scan-id.png"
          alt={t('features.feature-3.alt-1')}
          height={547}
          width={269}
          data-type="phone-left"
        />
        <Image
          src="/new-home/everything-you-need-section/feature-3/submit-drivers-license.png"
          alt={t('features.feature-3.alt-2')}
          height={547}
          width={269}
          data-type="phone-right"
        />
      </IllustrationContainer>
      <IllustrationContainer data-viewport="mobile">
        <Image
          src="/new-home/everything-you-need-section/feature-3/scan-id.png"
          alt={t('features.feature-3.alt-1')}
          height={345}
          width={169}
          data-type="phone-left"
        />
        <Image
          src="/new-home/everything-you-need-section/feature-3/submit-drivers-license.png"
          alt={t('features.feature-3.alt-2')}
          height={345}
          width={169}
          data-type="phone-right"
        />
      </IllustrationContainer>
    </>
  );
};

const IllustrationContainer = styled.div`
  position: relative;

  &[data-viewport='desktop'] [data-type='phone-left'] {
    display: none;
    position: absolute;
    top: 0;
    left: 40px;
    z-index: 1;

    ${media.greaterThan('md')`
      display: block;
    `}
  }

  &[data-viewport='desktop'] [data-type='phone-right'] {
    display: none;
    position: absolute;
    top: 32px;
    right: 40px;
    z-index: 2;

    ${media.greaterThan('md')`
      display: block;
    `}
  }

  &[data-viewport='tablet'] [data-type='phone-left'] {
    display: none;
    position: absolute;
    top: 0;
    left: 120px;
    z-index: 1;

    ${media.greaterThan('sm')`
      display: block;
    `}

    ${media.greaterThan('md')`
      display: none;
    `}
  }

  &[data-viewport='tablet'] [data-type='phone-right'] {
    display: none;
    position: absolute;
    top: 40px;
    right: 120px;
    z-index: 2;

    ${media.greaterThan('sm')`
      display: block;
    `}

    ${media.greaterThan('md')`
      display: none;
    `}
  }

  &[data-viewport='mobile'] [data-type='phone-left'] {
    display: block;
    position: absolute;
    top: -90px;
    left: 0;
    z-index: 1;

    ${media.greaterThan('sm')`
      display: none;
    `}
  }

  &[data-viewport='mobile'] [data-type='phone-right'] {
    position: absolute;
    top: -40px;
    right: 0;
    z-index: 1;

    ${media.greaterThan('sm')`
      display: none;
    `}
  }
`;

export default Illustration3;
