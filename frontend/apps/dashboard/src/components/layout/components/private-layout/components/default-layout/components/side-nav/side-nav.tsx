import { useRequestErrorToast } from '@onefootprint/hooks';
import { Box, Divider, Stack, createFontStyles } from '@onefootprint/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { getTime, isAfter, subDays } from 'date-fns';
import { useRouter } from 'next/router';
import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import useAssumeAuthRole from 'src/hooks/use-assume-auth-role';
import useAuthRoles from 'src/hooks/use-auth-roles';
import useSession from 'src/hooks/use-session';
import styled, { css } from 'styled-components';

import CompanyName from './components/company-name';
const NavDropdown = lazy(() => import('./components/nav-dropdown'));
import { getPrivateAccessRequestsOptions } from '@onefootprint/axios/dashboard';
import { useQuery } from '@tanstack/react-query';
import { RISK_OPS_TEAM_MEMBERS } from 'src/config/constants';
import NavLink from './components/nav-link';
import SettingsDropdown from './components/settings-dropdown';
import WhatsNewBanner from './components/whats-new-banner';
import WhatsNewDialog from './components/whats-new-dialog';
import useChangelogArticles from './hooks/use-changelog-articles';
import useRoutes from './hooks/use-routes/use-routes';
import type { PostDetails } from './side-nav.types';
import moveTenantToFront from './utils/move-tenant-to-front';

const WHATS_NEW_BANNER_KEY = 'whatsNewBannerInteracted';
const LAST_SEEN_POST_KEY = 'lastSeenPostDate';

const Nav = () => {
  const router = useRouter();
  const { data: posts = [] } = useChangelogArticles();
  const [recentPosts, setRecentPosts] = useState<PostDetails[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [openWhatsNewDialog, setOpenWhatsNewDialog] = useState(false);

  const {
    dangerouslyCastedData,
    logIn,
    data: { user, org },
  } = useSession();
  const assumeRoleMutation = useAssumeAuthRole();
  const showErrorToast = useRequestErrorToast();
  const tenantsQuery = useAuthRoles(dangerouslyCastedData.auth);
  const currTenantId = dangerouslyCastedData.org.id;
  const tenants = moveTenantToFront(tenantsQuery.data ?? [], currTenantId);
  const { data: accessRequests } = useQuery(getPrivateAccessRequestsOptions());
  const activeAccessRequests = Array.isArray(accessRequests)
    ? accessRequests.filter(accessRequest => accessRequest.expiresAt > new Date().toISOString())
    : [];
  const outstandingRiskOpsRequests = activeAccessRequests.filter(
    accessRequest => accessRequest.respondedAt === null,
  ).length;
  const isRiskOpsTeamMember = RISK_OPS_TEAM_MEMBERS.includes(user?.email ?? '');
  const routes = useRoutes({ riskOpsRequests: outstandingRiskOpsRequests, isRiskOpsTeamMember });

  useEffect(() => {
    if (posts.length > 0) {
      const sevenDaysAgo = subDays(new Date(), 7);
      const recentPosts = posts.filter(post => isAfter(new Date(post.publishedAt), sevenDaysAgo));
      setRecentPosts(recentPosts);

      const lastSeenPostDate = Number(localStorage.getItem(LAST_SEEN_POST_KEY) || 0);
      const hasInteracted = localStorage.getItem(WHATS_NEW_BANNER_KEY) === 'true';
      const newestPostDate = recentPosts[0]?.publishedAt ? getTime(new Date(recentPosts[0].publishedAt)) : 0;

      const shouldShowNewContent = newestPostDate > lastSeenPostDate;
      const shouldShowBanner = !hasInteracted && recentPosts.length > 0;

      if (shouldShowNewContent) {
        setShowBanner(true);
        localStorage.setItem(LAST_SEEN_POST_KEY, newestPostDate.toString());
      } else if (shouldShowBanner) {
        setShowBanner(true);
      }
    }
  }, [posts]);

  const handleWhatsNewOpen = useCallback(() => {
    setOpenWhatsNewDialog(true);
    localStorage.setItem(WHATS_NEW_BANNER_KEY, 'true');
    setShowBanner(false);
  }, []);

  const handleWhatsNewClose = useCallback(() => {
    setOpenWhatsNewDialog(false);
  }, []);

  const handleWhatsNewBannerDismiss = useCallback(() => {
    localStorage.setItem(WHATS_NEW_BANNER_KEY, 'true');
    setShowBanner(false);
  }, []);

  const onAssumeTenant = (tenantId: string) => {
    const authToken = dangerouslyCastedData.auth;
    assumeRoleMutation.mutate(
      { tenantId, authToken },
      {
        async onSuccess({ token }) {
          router.push('/users');
          await logIn({ auth: token });
        },
        onError: showErrorToast,
      },
    );
  };

  return (
    <>
      <NavContainer>
        <Links direction="column">
          {routes
            .filter(({ employeesOnly }) => !employeesOnly || !!user?.isFirmEmployee)
            .map(({ title, items }) => (
              <TabGroup key={title}>
                {title && <Title>{title}</Title>}
                {items.map(({ text, href, Icon, badgeCount }) =>
                  href === '/settings' ? (
                    <SettingsDropdown
                      key={text}
                      badgeCount={badgeCount}
                      href={href}
                      icon={Icon}
                      selected={router.pathname.startsWith(href)}
                      text={text}
                    />
                  ) : (
                    <Element key={text} asChild>
                      <NavLink
                        badgeCount={badgeCount}
                        href={href}
                        icon={Icon}
                        selected={router.pathname.startsWith(href)}
                        text={text}
                      />
                    </Element>
                  ),
                )}
              </TabGroup>
            ))}
        </Links>
        <Divider />

        <Stack
          direction="row"
          align="center"
          justify="space-between"
          width="100%"
          maxWidth="100%"
          paddingBottom={4}
          paddingLeft={5}
          paddingRight={5}
          paddingTop={4}
          height="56px"
          position="relative"
        >
          <WhatsNewBanner
            open={showBanner}
            onDismiss={handleWhatsNewBannerDismiss}
            onWhatsNewOpen={handleWhatsNewOpen}
          />
          {org ? <CompanyName name={org.name} image={org.logoUrl} /> : <Box width="100%" />}
          <Suspense fallback={<Box />}>
            <NavDropdown
              currTenantId={currTenantId}
              onAssumeTenant={onAssumeTenant}
              tenants={tenants}
              user={dangerouslyCastedData.user}
              posts={posts}
            />
          </Suspense>
        </Stack>
      </NavContainer>
      <WhatsNewDialog open={openWhatsNewDialog} onClose={handleWhatsNewClose} posts={recentPosts} />
    </>
  );
};

const NavContainer = styled(NavigationMenu.Root)`
  ${({ theme }) => css`
    position: relative;
    width: var(--side-nav-width);
    max-height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    border-right: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `};
`;

const Links = styled(Stack)`
  ${({ theme }) => css`
    flex: 1;
    overflow: auto;
    padding: ${theme.spacing[5]} ${theme.spacing[4]};
  `}
`;

const TabGroup = styled(NavigationMenu.List)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[1]};
    margin-bottom: ${theme.spacing[8]};
  `};
`;

const Title = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.tertiary};
    margin-bottom: ${theme.spacing[3]};
    padding: 0 ${theme.spacing[4]};
  `}
`;

const Element = styled(NavigationMenu.Link)``;

export default Nav;
