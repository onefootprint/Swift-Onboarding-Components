import { useTranslation } from '@onefootprint/hooks';
import { IcoPencil16 } from '@onefootprint/icons';
import { Tab, Tabs } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import useManualReview from './hooks/use-manual-review';

const ManualReviewNavigator = () => {
  const router = useRouter();
  const { t } = useTranslation('components.private-layout.nav');
  const { data: response } = useManualReview();

  const manualReviewRoute = {
    href: '/manual-review',
    Icon: IcoPencil16,
    text: t('manual-reviews'),
  };

  return (
    <Tabs variant="pill">
      <Tab
        key={manualReviewRoute.text}
        as={Link}
        href={manualReviewRoute.href}
        selected={router.pathname.startsWith(manualReviewRoute.href)}
        icon={manualReviewRoute.Icon}
      >
        {manualReviewRoute.text}
        {response && response.data?.length >= 0 && ` (${response.data.length})`}
      </Tab>
    </Tabs>
  );
};

export default ManualReviewNavigator;
