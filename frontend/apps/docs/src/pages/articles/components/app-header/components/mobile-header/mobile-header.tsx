import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoClose24, IcoMenu24, ThemedLogoFpCompact } from '@onefootprint/icons';
import { createFontStyles } from '@onefootprint/ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type MobileNavProps = {
  onClick: () => void;
  isExpanded: boolean;
};

const MobileNav = ({ onClick, isExpanded }: MobileNavProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.header' });
  return (
    <Header>
      <NavTriggerContainer>
        <NavTrigger
          type="button"
          onClick={onClick}
          aria-label={isExpanded ? t('nav.nav-toggle.close') : t('nav.nav-toggle.open')}
          aria-expanded={isExpanded}
        >
          {isExpanded ? <IcoClose24 /> : <IcoMenu24 />}
        </NavTrigger>
        <MainLinks>
          <LogoLink href={FRONTPAGE_BASE_URL} aria-label={t('nav.home')}>
            <ThemedLogoFpCompact color="primary" />
          </LogoLink>
          <Divider />
          <DocumentationLink href="/">{t('nav.documentation')}</DocumentationLink>
        </MainLinks>
      </NavTriggerContainer>
    </Header>
  );
};

const Header = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[5]};
  `};
`;

const NavTriggerContainer = styled.div`
  align-items: center;
  display: flex;

  > a {
    display: flex;
  }
`;

const NavTrigger = styled.button`
  ${({ theme }) => css`
    background: none;
    border: none;
    cursor: pointer;
    height: 24px;
    margin: 0;
    padding: 0;
    width: 24px;
    margin-right: ${theme.spacing[4]};
  `};
`;

const Divider = styled.div`
  ${({ theme }) => css`
    height: 100%;
    width: 1px;
    background-color: ${theme.borderColor.tertiary};
    height: 20px;
  `}
`;

const DocumentationLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    color: ${theme.color.tertiary};
    text-decoration: none;
  `}
`;

const MainLinks = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[3]};
    position: relative;
    height: 100%;
  `};
`;

const LogoLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default MobileNav;
