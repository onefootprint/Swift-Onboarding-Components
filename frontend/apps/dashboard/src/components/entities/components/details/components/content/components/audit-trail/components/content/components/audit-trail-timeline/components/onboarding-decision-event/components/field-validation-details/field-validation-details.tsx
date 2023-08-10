import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { Box, Drawer, LinkButton, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import ValidationItems from './components/validation-items';

const FieldValidationDetails = () => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.onboarding-decision-event.field-validation',
  );
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignContent: 'center',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Typography variant="label-3">·</Typography>
        <LinkButton
          onClick={() => {
            setDrawerOpen(true);
          }}
          size="compact"
        >
          {t('view-details')}
        </LinkButton>
      </Box>
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
