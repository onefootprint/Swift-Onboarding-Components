import IcoFootprint24 from 'icons/ico/ico-footprint-24';
import IcoUser24 from 'icons/ico/ico-user-24';
import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import styled, { css } from 'styled-components';
import { IconButton, media, Typography } from 'ui';

const Header = () => {
  const { logOut } = useSessionUser();
  const handleClick = () => {
    logOut();
    // TODO: https://linear.app/footprint/issue/FP-529/account-dropdown
  };

  return (
    <Container>
      <FootprintLogoContainer>
        <IcoFootprint24 />
        <Typography sx={{ marginLeft: 2 }} variant="display-4">
          Footprint
        </Typography>
      </FootprintLogoContainer>
      <IconButton
        iconComponent={IcoUser24}
        onClick={handleClick}
        aria-label="account"
      />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[4]}px ${theme.spacing[7]}px;

    ${media.greaterThan('sm')`
      margin-left: ${theme.spacing[10]}px;
      margin-right: ${theme.spacing[10]}px;
    `}
  `}
`;

const FootprintLogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
`;

export default Header;
