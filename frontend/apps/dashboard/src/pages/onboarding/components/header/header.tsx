import { useTranslation } from '@onefootprint/hooks';
import { IcoLogOut16, LogoFpCompact } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Box,
  Container,
  createFontStyles,
  Divider,
  LinkButton,
} from '@onefootprint/ui';
import React from 'react';

export type HeaderProps = {
  userEmail: string;
  onLogout: () => void;
};

const Header = ({ userEmail, onLogout }: HeaderProps) => {
  const { t } = useTranslation('pages.onboarding.header');

  return (
    <>
      <Container>
        <Inner>
          <LogoFpCompact />
          <Box>
            <Pill>
              {t('logged-as')} <span>{userEmail}</span>
            </Pill>
          </Box>
          <LinkButton iconComponent={IcoLogOut16} onClick={onLogout}>
            {t('logout')}
          </LinkButton>
        </Inner>
      </Container>
      <Divider />
    </>
  );
};

const Inner = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[5]}} 0;
  `}
`;

const Pill = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-4')};
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
    padding: ${theme.spacing[2]} ${theme.spacing[4]};

    span {
      ${createFontStyles('label-4')};
    }
  `}
`;

export default Header;
