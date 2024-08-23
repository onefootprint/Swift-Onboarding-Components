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
import { useTheme } from 'styled-components';
import NavLink from '../nav-link';

export type SettingsDropdownProps = {
  href: string;
  text: string;
  icon: Icon;
  badgeCount?: number;
  selected: boolean;
};

const SettingsDropdown = ({ href, text, icon, badgeCount, selected }: SettingsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('settings');
  const router = useRouter();
  const theme = useTheme();
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

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <Container>
      <DropdownHeader onClick={toggleDropdown} selected={selected}>
        <Element key={text} asChild>
          {/* we initially want to navigate to /business-profile vs. settings itself */}
          <NavLink badgeCount={badgeCount} href={subLinks[0].href} icon={icon} selected={selected} text={text} />
        </Element>
        <ChevronIcon isOpen={isOpen} />
      </DropdownHeader>
      <AnimatePresence>
        {isOpen && (
          <SubLinksContainer
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {subLinks.map(subLink => (
              <SubLinkWrapper key={subLink.href}>
                <AnimatedLineContainer>
                  <AnimatedLine
                    initial={{ backgroundColor: theme.backgroundColor.senary }}
                    animate={{
                      backgroundColor: router.pathname.startsWith(subLink.href)
                        ? theme.color.primary
                        : theme.backgroundColor.senary,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatedLineContainer>
                <SubLink href={subLink.href}>
                  <AnimatedSubLinkBackground
                    initial={{ backgroundColor: 'transparent' }}
                    whileHover={{ backgroundColor: theme.backgroundColor.secondary }}
                    transition={{ duration: 0.3 }}
                  >
                    <Text
                      color={router.pathname.startsWith(subLink.href) ? 'primary' : 'tertiary'}
                      variant={router.pathname.startsWith(subLink.href) ? 'label-4' : 'body-4'}
                    >
                      {subLink.text}
                    </Text>
                  </AnimatedSubLinkBackground>
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

const ChevronIcon = styled(IcoChevronRight24)<{ isOpen: boolean }>`
    transition: transform 0.3s ease;
    transform: ${({ isOpen }) => (isOpen ? 'rotate(90deg)' : 'rotate(0)')};
`;

const Element = styled(NavigationMenu.Link)`
    flex-grow: 1;
`;

const SubLinksContainer = styled(motion.div)`
    display: flex;
    flex-direction: column;
    margin: ${({ theme }) => theme.spacing[3]};
    margin-left: ${({ theme }) => theme.spacing[6]};
    position: relative;
    overflow: hidden;
`;

const SubLinkWrapper = styled.div`
    display: flex;
    align-items: center;
    position: relative;
`;

const SubLink = styled(Link)`
    text-decoration: none;
    flex-grow: 1;
`;

const AnimatedSubLinkBackground = styled(motion.div)`
    ${({ theme }) => css`
        padding: ${theme.spacing[2]} ${theme.spacing[4]};
        display: flex;
        align-items: center;
        position: relative;
        height: 32px;
        border-radius: ${theme.borderRadius.default};
    `}
`;

const AnimatedLineContainer = styled.div`
    height: 32px;
    width: 1px;
    margin-right: ${({ theme }) => theme.spacing[2]};
`;

const AnimatedLine = styled(motion.div)`
    width: 100%;
    height: 100%;
`;

export default SettingsDropdown;
