import { IcoLogOut16, LogoFpCompact } from '@onefootprint/icons';
import { Container, Divider, LinkButton, createFontStyles, media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type HeaderProps = {
  userEmail: string;
  onLogout: () => void;
};

const Header = ({ userEmail, onLogout }: HeaderProps) => {
  const { t } = useTranslation('onboarding', {
    keyPrefix: 'header',
  });

  return (
    <>
      <Container>
        <Inner>
          <LogoFpCompact />
          <PillContainer>
            <Pill>
              {t('logged-as')} <span>{userEmail}</span>
            </Pill>
          </PillContainer>
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
    padding: ${theme.spacing[5]} 0;
  `}
`;

const PillContainer = styled.div`
  display: none;

  ${media.greaterThan('md')`
    display: block;
  `}
`;

const Pill = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
    padding: ${theme.spacing[2]} ${theme.spacing[4]};

    span {
      ${createFontStyles('label-3')};
    }
  `}
`;

export default Header;
