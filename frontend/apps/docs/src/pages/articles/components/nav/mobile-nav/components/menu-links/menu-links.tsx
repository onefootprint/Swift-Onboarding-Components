import AppNav from 'src/components/app-nav';
import NavigationFooter from 'src/components/navigation-footer';
import type { PageNavigation } from 'src/types/page';
import styled, { css } from 'styled-components';

type PageNavProps = {
  navigation: PageNavigation;
  onNavItemClick: () => void;
};

const MenuLinks = ({ navigation, onNavItemClick }: PageNavProps) => (
  <MenuLinksContainer>
    <NavContainer>
      <AppNav navigation={navigation} onItemClick={onNavItemClick} />
    </NavContainer>
    <NavigationFooter />
  </MenuLinksContainer>
);

const MenuLinksContainer = styled.div`
  ${({ theme }) => css`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    ul {
      padding-top: ${theme.spacing[5]};
    }
  `}
`;

const NavContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[3]} ${theme.spacing[3]} ${theme.spacing[7]}
      ${theme.spacing[3]};
  `}
`;

export default MenuLinks;
