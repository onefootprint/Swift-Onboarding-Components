import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

import BaseIllustration from '../../../../components/base-illustration';

const TabletIllustration = () => {
  const { t } = useTranslation('pages.home.accurate-section');
  return (
    <IllustrationWrapper>
      <Image
        src="/new-home/accurate-section/audit-trail.png"
        height={394}
        width={520}
        alt={t('alt')}
        data-type="main"
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

  &[data-type='main'] {
    position: absolute;
    transform: translate(-50%, 50%);
    top: -35%;
    left: 50%;
  }

  ${media.greaterThan('sm')`
    display: block;
  `}

  ${media.greaterThan('md')`
    display: none;
  `}
`;

export default TabletIllustration;
