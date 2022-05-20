import React from 'react';
import styled, { css } from 'styled';

import FooterLinksContainer from './components/footer-links-container';
import SecuredByFootprint from './components/secured-by-footprint';

const FootprintFooter = () => {
  const links = [
    {
      label: "What's this?",
      link: 'https://www.onefootprint.com',
    },
    {
      label: 'Privacy',
      link: 'https://www.onefootprint.com/privacy-policy',
    },
    {
      label: 'Terms',
      link: 'https://www.onefootprint.com/terms',
    },
  ];

  return (
    <FooterContainer>
      <SecuredByFootprint />
      <FooterLinksContainer links={links} />
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  ${({ theme }) => css`
    margin-top: ${theme.spacing[7]}px;
  `}
`;

export default FootprintFooter;
