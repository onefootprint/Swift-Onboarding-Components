import { media, Stack } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import ContactDialog from '../../../../components/contact-dialog';
import PlanColumn from './components/plan-column';
import PlansDetails from './plans-table-data';
import { Plans } from './plans-table-types';

const GET_FORM_URL = 'https://getform.io/f/pbygomeb';

const PlansTable = () => {
  const [showDialog, setShowDialog] = useState(false);

  const getOnClick = (planId: string) => () => {
    if (planId === Plans.enterprise) {
      setShowDialog(true);
    } else if (planId === Plans.growth) {
      setShowDialog(true);
    } else {
      setShowDialog(true);
    }
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <Stack direction="column" align="center" justify="center" gap={7}>
      <PlansContainer direction="row" flexWrap="wrap">
        {PlansDetails.map(plan => (
          <PlanColumn
            key={plan.id}
            title={plan.title}
            price={{
              monthly: plan.price?.monthly,
              yearly: plan.price?.yearly,
            }}
            features={plan.features}
            buttonLabel={plan.buttonLabel}
            buttonVariant={plan.buttonVariant}
            onButtonClick={getOnClick(plan.id)}
          />
        ))}
      </PlansContainer>
      <ContactDialog
        url={GET_FORM_URL}
        open={showDialog}
        onClose={handleClose}
      />
    </Stack>
  );
};

const PlansContainer = styled(Stack)`
  ${({ theme }) => css`
    gap: ${theme.spacing[5]};

    ${media.greaterThan('md')`
        gap: 0;
      `}
  `}
`;

export default PlansTable;
