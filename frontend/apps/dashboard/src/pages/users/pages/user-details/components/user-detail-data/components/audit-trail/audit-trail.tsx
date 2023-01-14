import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';
import useUserTimeline from 'src/pages/users/pages/user-details/hooks/use-user-timeline';

import Header from '../header';
import AuditTrailTimeline from './components/audit-trail-timeline';

const AuditTrail = () => {
  const { t } = useTranslation('pages.user-details.audit-trail');
  const userId = useUserId();
  const { data = [], isLoading } = useUserTimeline(userId);

  // Add an id on the container because the ManualReviewBanner supports
  // auto-scrolling this component into view
  return (
    <div id="audit-trail">
      <Header title={t('title')} />
      <AuditTrailTimeline timeline={data} isLoading={isLoading} />
    </div>
  );
};

export default AuditTrail;
