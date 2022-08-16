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
import { UserDataAttribute } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import { FootprintButton, Typography } from 'ui';

import useConfirmOnboardingData from './hooks/use-confirm-onboarding-data';

enum UserDataAttributeCategory {
  name = 'Name',
  email = 'Email',
  phoneNumber = 'Phone Number',
  ssn = 'SSN (Full)',
  lastFourSsn = 'SSN (Last 4)',
  dob = 'Date of Birth',
  address = 'Address',
}

const CategoryByUserDataAttribute: Record<
  UserDataAttribute | string,
  UserDataAttributeCategory
> = {
  [UserDataAttribute.firstName]: UserDataAttributeCategory.name,
  [UserDataAttribute.lastName]: UserDataAttributeCategory.name,
  [UserDataAttribute.dob]: UserDataAttributeCategory.dob,
  [UserDataAttribute.email]: UserDataAttributeCategory.email,
  [UserDataAttribute.phone]: UserDataAttributeCategory.phoneNumber,
  [UserDataAttribute.ssn]: UserDataAttributeCategory.ssn,
  [UserDataAttribute.lastFourSsn]: UserDataAttributeCategory.lastFourSsn,
  [UserDataAttribute.streetAddress]: UserDataAttributeCategory.address,
  [UserDataAttribute.streetAddress2]: UserDataAttributeCategory.address,
  [UserDataAttribute.city]: UserDataAttributeCategory.address,
  [UserDataAttribute.state]: UserDataAttributeCategory.address,
  [UserDataAttribute.country]: UserDataAttributeCategory.address,
  [UserDataAttribute.zip]: UserDataAttributeCategory.address,
};

const IconsByUserDataAttributes: Record<
  UserDataAttributeCategory,
  JSX.Element
> = {
  [UserDataAttributeCategory.name]: <IcoUserCircle24 />,
  [UserDataAttributeCategory.email]: <IcoEmail24 />,
  [UserDataAttributeCategory.phoneNumber]: <IcoPhone24 />,
  [UserDataAttributeCategory.ssn]: <IcoFileText24 />,
  [UserDataAttributeCategory.lastFourSsn]: <IcoFileText24 />,
  [UserDataAttributeCategory.dob]: <IcoCake24 />,
  [UserDataAttributeCategory.address]: <IcoBuilding24 />,
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

  const requiredData = state.context.tenant.canAccessDataKinds
    .map((data: UserDataAttribute) => CategoryByUserDataAttribute[data])
    .filter(attr => !!attr);
  const requiredCategories = Array.from(
    new Set<UserDataAttributeCategory>(requiredData),
  );

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle
          title={t('title')}
          subtitle={t('subtitle', { tenantName: state.context.tenant.name })}
        />
        <CategoriesContainer>
          {requiredCategories.map((category: UserDataAttributeCategory) => (
            <Category key={category}>
              <IconContainer>
                {IconsByUserDataAttributes[category]}
              </IconContainer>
              <Typography variant="label-3">{category}</Typography>
            </Category>
          ))}
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
