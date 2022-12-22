import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

import BaseIllustration from '../../../../components/base-illustration/base-illustration';

const MobileIllustration = () => {
  const { t } = useTranslation('pages.home.own-data-section');
  return (
    <IllustrationWrapper>
      <Image
        src="/new-home/own-data/decrypt-data.png"
        height={312}
        width={270}
        alt={t('alt')}
        className="main-img"
      />
      <Image
        src="/new-home/own-data/table.png"
        height={528}
        width={750}
        alt={t('alt')}
        className="secondary-img"
      />
    </IllustrationWrapper>
  );
};

const IllustrationWrapper = styled(BaseIllustration)`
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(at 0% 0%, #fff6f3 16%, rgba(246, 209, 193, 0) 50%),
    radial-gradient(at 0% 100%, #f2f9ff 0%, rgba(200, 228, 255, 0) 100%),
    radial-gradient(at 100% 50%, #fefff0 0%, white 100%), white;

  .main-img {
    z-index: 1;
  }

  .secondary-img {
    transform: translate(0, 50%);
    z-index: 0;
    position: absolute;
    bottom: 10%;
    left: -10%;
  }
  ${media.greaterThan('sm')`
    display: none;
  `}
`;

export default MobileIllustration;
