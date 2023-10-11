import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { Drawer, LinkButton, Stack } from '@onefootprint/ui';
import React, { useState } from 'react';

import ValidationItems from './components/validation-items';

const FieldValidationDetails = () => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.onboarding-decision-event.field-validation',
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
        <ValidationItemsContainer>
          <ValidationItems />
        </ValidationItemsContainer>
      </Drawer>
    </>
  );
};

const ValidationItemsContainer = styled.div`
  margin-left: -150px;
`;

export default FieldValidationDetails;
