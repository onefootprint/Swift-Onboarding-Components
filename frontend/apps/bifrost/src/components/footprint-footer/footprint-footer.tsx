import { useDeviceType } from 'hooks';
import React from 'react';
import styled from 'styled-components';

import DesktopFooter from './components/desktop-footer';
import MobileFooter from './components/mobile-footer';
import type { Link } from './footprint-footer.types';

const FootprintFooter = () => {
  const deviceType = useDeviceType();
  const links: Link[] = [
    {
      label: "What's this?",
      href: 'https://www.onefootprint.com',
    },
    {
      label: 'Privacy',
      href: 'https://www.onefootprint.com/privacy-policy',
    },
  ];

  return (
    <Container>
      {deviceType === 'mobile' ? (
        <MobileFooter links={links} />
      ) : (
        <DesktopFooter links={links} />
      )}
    </Container>
  );
};

const Container = styled.footer`
  flex-shrink: 0;
`;

export default FootprintFooter;
