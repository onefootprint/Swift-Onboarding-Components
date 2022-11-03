import { IcoFootprint24, IcoUser24 } from '@onefootprint/icons';
import { Container, IconButton, Typography } from '@onefootprint/ui';
import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import styled, { css } from 'styled-components';

const Header = () => {
  const { logOut } = useSessionUser();
  const handleClick = () => {
    logOut();
    // TODO: https://linear.app/footprint/issue/FP-529/account-dropdown
  };

  return (
    <Container>
      <Inner>
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
      </Inner>
    </Container>
  );
};

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[4]} ${theme.spacing[7]};
  `}
`;

const FootprintLogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
`;

export default Header;
