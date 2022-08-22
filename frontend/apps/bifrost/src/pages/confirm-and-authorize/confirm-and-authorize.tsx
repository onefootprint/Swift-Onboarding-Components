import { useIsMutating } from '@tanstack/react-query';
import { HeaderTitle } from 'footprint-ui';
import { useTranslation } from 'hooks';
import IcoBuilding24 from 'icons/ico/ico-building-24';
import IcoCake24 from 'icons/ico/ico-cake-24';
import IcoEmail24 from 'icons/ico/ico-email-24';
import IcoFileText24 from 'icons/ico/ico-file-text-24';
import IcoPhone24 from 'icons/ico/ico-phone-24';
import IcoUserCircle24 from 'icons/ico/ico-user-circle-24';
import React from 'react';
import { useBifrostMachine } from 'src/components/bifrost-machine-provider';
import NavigationHeader from 'src/components/navigation-header';
import { CollectedDataOption } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import { FootprintButton, Typography } from 'ui';

import useConfirmOnboardingData from './hooks/use-confirm-onboarding-data';

const IconByCollectedDataOption: Record<CollectedDataOption, JSX.Element> = {
  [CollectedDataOption.name]: <IcoUserCircle24 />,
  [CollectedDataOption.email]: <IcoEmail24 />,
  [CollectedDataOption.phoneNumber]: <IcoPhone24 />,
  [CollectedDataOption.ssn4]: <IcoFileText24 />,
  [CollectedDataOption.ssn9]: <IcoFileText24 />,
  [CollectedDataOption.dob]: <IcoCake24 />,
  [CollectedDataOption.fullAddress]: <IcoBuilding24 />,
  [CollectedDataOption.partialAddress]: <IcoBuilding24 />,
};

export const collectedDataOptionLabels: Record<CollectedDataOption, string> = {
  [CollectedDataOption.name]: 'Name',
  [CollectedDataOption.email]: 'Email',
  [CollectedDataOption.phoneNumber]: 'Phone Number',
  [CollectedDataOption.ssn4]: 'SSN (Last 4)',
  [CollectedDataOption.ssn9]: 'SSN (Full)',
  [CollectedDataOption.dob]: 'Date of Birth',
  [CollectedDataOption.fullAddress]: 'Address (Full)',
  [CollectedDataOption.partialAddress]: 'Country & Zip Code',
};

const ConfirmAndAuthorize = () => {
  const confirmOnboardingData = useConfirmOnboardingData();
  const isMutating = useIsMutating();
  const { t } = useTranslation('pages.confirm-and-authorize');
  const [state] = useBifrostMachine();

  const handleClick = () => {
    const handleConfirmOnboardingCompleted = () => {};
    confirmOnboardingData({ onComplete: handleConfirmOnboardingCompleted });
  };

  const { canAccessData } = state.context.tenant;
  const requiredCategories = canAccessData;

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle
          title={t('title')}
          subtitle={t('subtitle', { tenantName: state.context.tenant.name })}
        />
        <CategoriesContainer>
          {requiredCategories.map(
            (collectedDataOption: CollectedDataOption) => (
              <Category key={collectedDataOption}>
                <IconContainer>
                  {IconByCollectedDataOption[collectedDataOption]}
                </IconContainer>
                <Typography variant="label-3">
                  {collectedDataOptionLabels[collectedDataOption]}
                </Typography>
              </Category>
            ),
          )}
        </CategoriesContainer>
        <FootprintButton
          fullWidth
          loading={isMutating > 0}
          onClick={handleClick}
          text={t('cta')}
        />
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[8]}px;
    justify-content: center;
    align-items: center;
  `}
`;

const IconContainer = styled.span`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[2]}px;
  `}
`;

const Category = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: left;
    align-items: center;
    margin-bottom: ${theme.spacing[3]}px;
  `}
`;

const CategoriesContainer = styled.div`
  ${({ theme }) => css`
    column-count: 2;
    width: 100%;
    margin-bottom: -${theme.spacing[3]}px;
  `}
`;

export default ConfirmAndAuthorize;
