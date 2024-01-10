import { useTranslation } from '@onefootprint/hooks';
import { Drawer, LinkButton, Stack } from '@onefootprint/ui';
import React, { useState } from 'react';

import FieldValidations from './components/field-validations';

const NotVerifiedDetails = () => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.onboarding-decision-event.not-verified-details',
  );
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Stack align="center" justify="center" gap={2}>
        <Stack align="center" justify="center" marginLeft={2} marginRight={2}>
          ·
        </Stack>
        <LinkButton
          onClick={() => {
            setDrawerOpen(true);
          }}
          size="compact"
        >
          {t('view-details')}
        </LinkButton>
      </Stack>
      <Drawer
        open={isDrawerOpen}
        title={t('drawer.title')}
        onClose={() => {
          setDrawerOpen(false);
        }}
      >
        <FieldValidations />
      </Drawer>
    </>
  );
};

export default NotVerifiedDetails;
