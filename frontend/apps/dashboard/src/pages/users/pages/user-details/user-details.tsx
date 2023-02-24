import { useTranslation } from '@onefootprint/hooks';
import { UserStatus } from '@onefootprint/types';
import { Box, Breadcrumb, BreadcrumbItem } from '@onefootprint/ui';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';
import useUserVault from 'src/pages/users/pages/user-details/hooks/use-user-vault';

import DecryptMachineProvider from './components/decrypt-machine-provider';
import IncompleteBanner from './components/incomplete-banner';
import ManualReviewBanner from './components/manual-review-banner';
import UserDetailsData from './components/user-detail-data';
import UserDetailEmptyState from './components/user-detail-empty-state';
import UserDetailsLoading from './components/user-detail-loading';
import useUser from './hooks/use-user';

const UserDetails = () => {
  const { t } = useTranslation('pages.user-details');
  const userId = useUserId();
  const userQuery = useUser(userId);
  const userVaultDataQuery = useUserVault(userId, userQuery.data);
  const shouldShowData = userQuery.isSuccess && userVaultDataQuery.isSuccess;
  const shouldShowLoading =
    userQuery.isLoading || (!!userQuery.data && userVaultDataQuery.isLoading);
  const shouldShowEmptyState = !userQuery.data && !userQuery.isLoading;
  const shouldShowIncompleteBanner =
    shouldShowData && userQuery.data.status === UserStatus.incomplete;
  const shouldShowManualReviewBanner =
    !shouldShowIncompleteBanner &&
    shouldShowData &&
    userQuery.data.requiresManualReview;

  const handleClickAuditTrailLink = () => {
    const auditTrail = document.getElementById('audit-trail');
    auditTrail?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      {shouldShowIncompleteBanner && (
        <Box sx={{ marginBottom: 7 }}>
          <IncompleteBanner onClickAuditTrailLink={handleClickAuditTrailLink} />
        </Box>
      )}
      {shouldShowManualReviewBanner && (
        <Box sx={{ marginBottom: 7 }}>
          <ManualReviewBanner
            status={userQuery.data.status}
            onClickAuditTrailLink={handleClickAuditTrailLink}
          />
        </Box>
      )}
      <Box sx={{ marginBottom: 7 }}>
        <Breadcrumb aria-label={t('breadcrumb.title')}>
          <BreadcrumbItem href="/users" as={Link}>
            {t('breadcrumb.users')}
          </BreadcrumbItem>
          <BreadcrumbItem>{t('breadcrumb.details')}</BreadcrumbItem>
        </Breadcrumb>
      </Box>
      <DecryptMachineProvider>
        {shouldShowLoading && <UserDetailsLoading />}
        {shouldShowData && (
          <UserDetailsData
            user={{ ...userQuery.data, vaultData: userVaultDataQuery.data }}
          />
        )}
        {shouldShowEmptyState && <UserDetailEmptyState />}
      </DecryptMachineProvider>
    </>
  );
};

export default UserDetails;
