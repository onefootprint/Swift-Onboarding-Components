import { useTranslation } from '@onefootprint/hooks';
import { Box, Breadcrumb, BreadcrumbItem } from '@onefootprint/ui';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import useUser from 'src/hooks/use-user';

import DecryptMachineProvider from './components/decrypt-machine-provider';
import ManualReviewBanner from './components/manual-review-banner';
import UserDetailsData from './components/user-detail-data';
import UserDetailEmptyState from './components/user-detail-empty-state';
import UserDetailsLoading from './components/user-detail-loading';
import useUserId from './hooks/use-user-id';

const UserDetails = () => {
  const { t } = useTranslation('pages.user-details');
  const userId = useUserId();
  const { user, loadingStates } = useUser(userId);
  const { metadata } = user;
  const shouldShowData = metadata && !loadingStates.metadata;
  const shouldShowEmptyState = !metadata && !loadingStates.metadata;
  const shouldShowManualReviewBanner =
    shouldShowData && metadata?.requiresManualReview;

  const handleClickAuditTrailLink = () => {
    const auditTrail = document.getElementById('audit-trail');
    auditTrail?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      {shouldShowManualReviewBanner && (
        <Box sx={{ marginBottom: 7 }}>
          <ManualReviewBanner
            status={metadata.status}
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
        {loadingStates.metadata && <UserDetailsLoading />}
        {shouldShowData && <UserDetailsData />}
        {shouldShowEmptyState && <UserDetailEmptyState />}
      </DecryptMachineProvider>
    </>
  );
};

export default UserDetails;
