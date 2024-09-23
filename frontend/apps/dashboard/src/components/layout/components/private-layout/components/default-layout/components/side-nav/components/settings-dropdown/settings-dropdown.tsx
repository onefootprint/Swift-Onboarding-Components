import { IcoChevronRight24, type Icon } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePermissions from 'src/hooks/use-permissions';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';
import NavLink from '../nav-link';

export type SettingsDropdownProps = {
  href: string;
  text: string;
  icon: Icon;
  badgeCount?: number;
  selected: boolean;
};

const SettingsDropdown = ({ href, text, icon, badgeCount, selected }: SettingsDropdownProps) => {
  const router = useRouter();
  const { t } = useTranslation('settings');
  const {
    data: { user, org },
  } = useSession();
  const { isAdmin } = usePermissions();

  const subLinks = [
    { href: `${href}/business-profile`, text: t('pages.business-profile.title') },
    { href: `${href}/team-roles`, text: t('pages.team-roles.title') },
  ];
  const shouldShowBilling = (org?.id === 'org_AiK8peOw9mrqsb6yeHWEG8' && isAdmin) || user?.isFirmEmployee;
  if (shouldShowBilling) {
    subLinks.push({ href: `${href}/billing`, text: t('pages.billing.title') });
  }

  const menuActive = subLinks.some(subLink => router.pathname.startsWith(subLink.href));
  const [isOpen, setIsOpen] = useState(menuActive);
  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <Container>
      <DropdownHeader onClick={toggleDropdown} selected={selected}>
        <Element key={text} asChild>
          {/* this will be a no-op re clicking - by navigating to router.pathname, we don't change pages */}
          <NavLink badgeCount={badgeCount} icon={icon} selected={menuActive} text={text} href={router.pathname} />
        </Element>
        <ChevronIcon isOpen={isOpen} color={menuActive ? 'primary' : 'tertiary'} />
      </DropdownHeader>
      <AnimatePresence>
        {isOpen && (
          <SubLinksContainer
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.1 }}
            layout
          >
            {subLinks.map(subLink => (
              <SubLinkWrapper key={subLink.href}>
                {router.pathname.startsWith(subLink.href) && (
                  <ActiveMarker layoutId="activeMarker" transition={{ duration: 0.1 }} />
                )}
                <SubLink href={subLink.href}>
                  <Text
                    color={router.pathname.startsWith(subLink.href) ? 'primary' : 'tertiary'}
                    variant={router.pathname.startsWith(subLink.href) ? 'label-3' : 'body-3'}
                  >
                    {subLink.text}
                  </Text>
                </SubLink>
              </SubLinkWrapper>
            ))}
          </SubLinksContainer>
        )}
      </AnimatePresence>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const DropdownHeader = styled.div<{ selected: boolean }>`
  ${({ selected, theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing[3]};
    padding-right: ${theme.spacing[3]};
    text-decoration: none;
    border-radius: ${theme.borderRadius.default};
    background-color: ${selected ? theme.backgroundColor.secondary : theme.backgroundColor.primary};
    cursor: pointer;

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }

    &:hover > * {
      background-color: ${theme.backgroundColor.secondary};
    }

    ${
      !selected &&
      css`
        &:hover .badge {
          color: ${theme.color.secondary};
          background-color: ${theme.backgroundColor.senary};
        }
      `
    }

    .badge {
      color: ${theme.color.tertiary};
      background-color: ${theme.backgroundColor.secondary};
    }
  `};
`;

const Element = styled(NavigationMenu.Link)`
  flex-grow: 1;
`;

const ChevronIcon = styled(IcoChevronRight24)<{ isOpen: boolean }>`
  ${({ isOpen }) => css`
    transition: transform 0.3s ease;
    transform: ${isOpen ? 'rotate(90deg)' : 'rotate(0)'};
  `}
`;

const SubLinksContainer = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    margin: ${theme.spacing[3]};
    margin-left: ${theme.spacing[6]};
    position: relative;
    border-left: ${theme.borderWidth[1]} solid ${theme.backgroundColor.senary};
  `}
`;

const SubLinkWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const ActiveMarker = styled(motion.div)`
  ${({ theme }) => css`
    position: absolute;
    left: calc(${theme.borderWidth[1]} * -1);
    z-index: 1;
    width: ${theme.borderWidth[1]};
    height: 100%;
    background-color: ${theme.color.primary};
  `}
`;

const SubLink = styled(Link)`
  ${({ theme }) => css`
    text-decoration: none;
    padding: ${theme.spacing[2]} ${theme.spacing[4]};
    flex-grow: 1;
    border-radius: ${theme.borderRadius.default};
    height: 32px;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    transition: background-color 0.1s ease;
    margin-left: ${theme.spacing[2]};

    &:hover {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

export default SettingsDropdown;
