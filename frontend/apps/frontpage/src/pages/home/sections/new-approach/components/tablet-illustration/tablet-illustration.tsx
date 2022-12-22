import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

import BaseIllustration from '../../../../components/base-illustration';

const DesktopIllustration = () => {
  const { t } = useTranslation('pages.home.new-approach-section');
  return (
    <IllustrationWrapper>
      <Image
        src="/new-home/new-approach-illu/phone.png"
        height={694.5}
        width={339}
        alt={t('features.alt')}
        className="phone-image"
        priority
      />
      <Image
        src="/new-home/new-approach-illu/code.png"
        height={382.5}
        width={720}
        alt={t('features.alt')}
        className="code-image"
        priority
      />
    </IllustrationWrapper>
  );
};

const IllustrationWrapper = styled(BaseIllustration)`
  display: none;
  position: relative;
  background: radial-gradient(at 0% 0%, #fff6f3 16%, rgba(246, 209, 193, 0) 50%),
    radial-gradient(at 0% 100%, #f2f9ff 0%, rgba(200, 228, 255, 0) 100%),
    radial-gradient(at 100% 50%, #fefff0 0%, white 100%), white;

  .phone-image {
    transform: translate(-50%, 0%);
    position: absolute;
    left: 50%;
    top: 10%;
    z-index: 1;
  }
  .code-image {
    transform: translate(-50%, 50%);
    position: absolute;
    left: 50%;
    bottom: 0%;
    z-index: 0;
  }

  ${media.greaterThan('sm')`
      display: block;
  `}

  ${media.greaterThan('md')`
      display: none;
  `}
`;
export default DesktopIllustration;
