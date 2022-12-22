import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import BaseIllustration from 'src/pages/home/components/base-illustration';
import styled from 'styled-components';

const TabletIllustration = () => {
  const { t } = useTranslation('pages.home.identity-wallet');
  return (
    <IllustrationWrapper>
      <Image
        src="/new-home/id-wallet/id-wallet.png"
        height={740}
        width={1020}
        alt={t('alt')}
        id="main-img"
      />
    </IllustrationWrapper>
  );
};

const IllustrationWrapper = styled(BaseIllustration)`
  position: relative;
  display: none;
  background: radial-gradient(at 0% 0%, #fff6f3 16%, rgba(246, 209, 193, 0) 50%),
    radial-gradient(at 0% 100%, #f2f9ff 0%, rgba(200, 228, 255, 0) 100%),
    radial-gradient(at 100% 50%, #fefff0 0%, white 100%), white;

  ${media.greaterThan('sm')`
    display: block;
  `}

  ${media.greaterThan('md')`
    display: none;
  `}

  #main-img {
    z-index: 1;
    position: absolute;
    top: -40%;
    left: 0%;
  }
`;

export default TabletIllustration;
