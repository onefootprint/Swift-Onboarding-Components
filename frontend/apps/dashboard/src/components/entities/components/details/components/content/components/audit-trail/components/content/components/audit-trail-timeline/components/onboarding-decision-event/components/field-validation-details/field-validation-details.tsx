import { useTranslation } from '@onefootprint/hooks';
import { Drawer, LinkButton } from '@onefootprint/ui';
import React, { useState } from 'react';
import useEntityId from 'src/components/entities/components/details/hooks/use-entity-id';
import styled from 'styled-components';

import ValidationItems from './components/validation-items';
import useEntityMatchSignals from './hooks/use-entity-match-signals';

const FieldValidationDetails = () => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.onboarding-decision-event.field-validation',
  );
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const id = useEntityId();
  const { data } = useEntityMatchSignals(id);

  return data && data.length > 0 ? (
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
          <ValidationItems data={data} />
        </ValidationItemsContainer>
      </Drawer>
    </>
  ) : null;
};

const ValidationItemsContainer = styled.div`
  margin-left: -150px;
`;

export default FieldValidationDetails;
