import styled, { css } from '@onefootprint/styled';
import { media, Stack } from '@onefootprint/ui';
import React, { useState } from 'react';

import ContactDialog from '../../../../components/contact-dialog';
import PlanColumn from './components/plan-column';
import Toggle from './components/toggle';
import PlansDetails from './plans-table-data';
import { type Period, Periods, Plans } from './plans-table-types';

const GET_FORM_URL =
  'https://getform.io/f/9f26eb67-51b3-4685-8dc4-8cf458e698e1';

const PlansTable = () => {
  const [period, setPeriod] = useState<Period>(Periods.yearly);
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

  const handleValueChange = (value: Period) => {
    if (value) setPeriod(value);
  };

  return (
    <Stack direction="column" align="center" justify="center" gap={7}>
      <Toggle
        onValueChange={(newValue: Period) => handleValueChange(newValue)}
        value={period}
      />
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
            period={period}
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
