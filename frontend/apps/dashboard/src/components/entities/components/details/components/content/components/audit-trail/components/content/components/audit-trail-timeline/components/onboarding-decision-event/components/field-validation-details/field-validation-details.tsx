import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { Drawer, LinkButton } from '@onefootprint/ui';
import React, { useState } from 'react';

import ValidationItems from './components/validation-items';

const FieldValidationDetails = () => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.onboarding-decision-event.field-validation',
  );
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <LinkButton
        onClick={() => {
          setDrawerOpen(true);
        }}
        size="compact"
      >
        {t('view-details')}
      </LinkButton>
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
