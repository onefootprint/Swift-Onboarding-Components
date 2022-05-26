import IcoFootprint24 from 'icons/ico/ico-footprint-24';
import IcoUser24 from 'icons/ico/ico-user-24';
import React from 'react';
import styled, { css } from 'styled';
import { Container, IconButton, Typography } from 'ui';

import useSessionUser from '../../../../hooks/use-session-user';

type PrivateLayoutProps = {
  children: React.ReactNode;
};

const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const { logOut } = useSessionUser();
  return (
    <div data-testid="private-layout">
      <header>
        <Container>
          <Footprint>
            <FootprintLogoContainer>
              <IcoFootprint24 />
            </FootprintLogoContainer>
            <Typography variant="display-4">Footprint</Typography>
            <SuffixContainer>
              <IconButton
                Icon={IcoUser24}
                onClick={logOut}
                ariaLabel="account"
              />
            </SuffixContainer>
          </Footprint>
        </Container>
        <NavContainer>
          <Container>
            <nav>
              <NavList>
                <PillTab text="Users" selected />
                <PillTab text="Access logs" />
                <PillTab text="Developers" />
                <PillTab text="Settings" />
              </NavList>
            </nav>
          </Container>
        </NavContainer>
      </header>
      <section>
        <Container>{children}</Container>
      </section>
    </div>
  );
};

type PillTabProps = {
  text: string;
  selected?: boolean;
};

// TODO migrate to PillTab component from component library
const PillTab = ({ text, selected }: PillTabProps) => {
  const textColor = selected ? 'quinary' : 'primary';
  return (
    <PillTabContainer selected={selected}>
      <Typography
        variant="label-4"
        color={textColor}
        sx={{ userSelect: 'none' }}
      >
        {text}
      </Typography>
    </PillTabContainer>
  );
};

const PillTabContainer = styled.li<{
  selected?: boolean;
}>`
  cursor: pointer;
  transition: 0.1s;
  p {
    transition: 0.1s;
  }

  ${({ theme }) => css`
    padding: ${theme.spacing[2]}px ${theme.spacing[4]}px;
    border-radius: ${theme.borderRadius[3]}px;
    background-color: transparent;
  `};
  ${({ theme, selected }) =>
    selected &&
    css`
      background-color: ${theme.backgroundColor.accent};
    `};

  :hover {
    ${({ theme }) => css`
      background-color: ${theme.overlay.darken[2]};
      p {
        color: ${theme.color.primary};
      }
    `};
  }
`;

const Footprint = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  ${({ theme }) => css`
    padding: ${theme.spacing[4]}px 0;
  `};
`;

const FootprintLogoContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SuffixContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: center;
`;

const NavContainer = styled.div`
  height: 44px;
  ${({ theme }) => css`
    border-top: 1px solid ${theme.borderColor.tertiary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.secondary};
    margin-bottom: ${theme.spacing[7]}px;
  `};
`;

const NavList = styled.ul`
  display: inline-flex;
  flex-direction: row;
  ${({ theme }) => css`
    padding: ${theme.spacing[3]}px 0;
    column-gap: ${theme.spacing[4]}px;
  `};
`;

export default PrivateLayout;
