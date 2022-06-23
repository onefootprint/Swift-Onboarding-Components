import IcoBuilding24 from 'icons/ico/ico-building-24';
import IcoCake24 from 'icons/ico/ico-cake-24';
import IcoEmail24 from 'icons/ico/ico-email-24';
import IcoFileText24 from 'icons/ico/ico-file-text-24';
import IcoPhone24 from 'icons/ico/ico-phone-24';
import IcoUserCircle24 from 'icons/ico/ico-user-circle-24';
import React from 'react';
import HeaderTitle from 'src/components/header-title';
import { useBifrostMachine } from 'src/components/machine-provider';
import { Events } from 'src/hooks/use-bifrost-machine';
import { UserDataAttribute } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import { FootprintButton, Typography } from 'ui';

enum UserDataAttributeCategory {
  name = 'Name',
  email = 'Email',
  phoneNumber = 'Phone Number',
  ssn = 'SSN',
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
  [UserDataAttributeCategory.dob]: <IcoCake24 />,
  [UserDataAttributeCategory.address]: <IcoBuilding24 />,
};

const Confirmation = () => {
  const [state, send] = useBifrostMachine();
  const handleClick = () => {
    send({
      type: Events.sharedDataConfirmed,
    });
  };

  const requiredData = state.context.tenant.requiredUserData.map(
    (data: UserDataAttribute) => CategoryByUserDataAttribute[data],
  );
  const requiredCategories = Array.from(
    new Set<UserDataAttributeCategory>(requiredData),
  );

  return (
    <Container>
      <HeaderTitle
        title="Confirm & Authorize"
        subtitle={`${state.context.tenant.name} will be able to securely view the following data:`}
      />
      <CategoriesContainer>
        {requiredCategories.map((category: UserDataAttributeCategory) => (
          <Category key={category}>
            <IconContainer>{IconsByUserDataAttributes[category]}</IconContainer>
            <Typography variant="label-3">{category}</Typography>
          </Category>
        ))}
      </CategoriesContainer>
      <FootprintButton onClick={handleClick} fullWidth text="Authorize" />
    </Container>
  );
};

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

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[8]}px;
    justify-content: center;
    align-items: center;
  `}
`;

export default Confirmation;
