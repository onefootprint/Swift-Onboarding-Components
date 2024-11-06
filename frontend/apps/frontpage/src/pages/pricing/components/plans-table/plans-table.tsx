import { Button, Container, Stack, media } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import ContactDialog from '../../../../components/contact-dialog';
import EverythingAndBanner from './components/everything-and-banner';
import FeatureCheck from './components/feature-check';
import Header from './components/header';
import PlansDetails from './plans-table-data';
import { Plans } from './plans-table-types';

const PlansTable = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { t } = useTranslation('common', { keyPrefix: 'pages.pricing' });

  const handleClick = () => {
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <>
      <PlansContainer>
        {PlansDetails.map(plan => (
          <React.Fragment key={plan.id}>
            <PlanContent $gridArea={`${plan.id}-content`}>
              <Header title={t(`plans.${plan.title}.title` as ParseKeys<'common'>)} price={plan.price} />
              <Stack direction="column" flexGrow={1} gap={3} padding={5} height="100%">
                {plan.title !== Plans.startup && <EverythingAndBanner plan={plan.title} />}
                {plan.features.map(feature => (
                  <FeatureCheck key={feature.translation} soon={feature.soon}>
                    {t(`plans.${plan.title}.${feature.translation}` as ParseKeys<'common'>)}
                  </FeatureCheck>
                ))}
              </Stack>
            </PlanContent>
            <ButtonWrapper $gridArea={`${plan.id}-button`}>
              <Button variant={plan.buttonVariant} onClick={handleClick} fullWidth size="large">
                {t(`plans.${plan.title}.${plan.buttonLabel}` as ParseKeys<'common'>)}
              </Button>
            </ButtonWrapper>
          </React.Fragment>
        ))}
      </PlansContainer>
      <ContactDialog open={showDialog} onClose={handleClose} />
    </>
  );
};

const PlansContainer = styled(Container)`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    gap: ${theme.spacing[7]};
    grid-template-areas:
      '${Plans.startup}-content'
      '${Plans.startup}-button'
      '${Plans.growth}-content'
      '${Plans.growth}-button'
      '${Plans.enterprise}-content'
      '${Plans.enterprise}-button';
    justify-content: center;
    align-items: stretch;
    padding-bottom: ${theme.spacing[10]};
    padding-top: ${theme.spacing[9]};

    ${media.greaterThan('md')`
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-template-rows: 1fr auto;
      grid-template-areas:
        '${Plans.startup}-content ${Plans.growth}-content ${Plans.enterprise}-content'
        '${Plans.startup}-button ${Plans.growth}-button ${Plans.enterprise}-button';
      padding-bottom: ${theme.spacing[11]};
      padding-top: ${theme.spacing[5]};
    `}
  `}
`;

const PlanContent = styled.div<{ $gridArea: string }>`
  ${({ $gridArea }) => css`
    display: flex;
    flex-direction: column;
    height: 100%;
    grid-area: ${$gridArea};
  `}
`;

const ButtonWrapper = styled.div<{ $gridArea: string }>`
  ${({ $gridArea, theme }) => css`
    grid-area: ${$gridArea};
    padding: 0 ${theme.spacing[5]};
    margin-bottom: ${theme.spacing[7]};

    ${media.greaterThan('md')`
      
      margin-bottom: 0;
    `}
  `}
`;

export default PlansTable;
