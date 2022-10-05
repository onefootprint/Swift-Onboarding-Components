import { useTranslation } from '@onefootprint/hooks';
import {
  IcoBuilding24,
  IcoFileText224,
  IcoUserCircle24,
} from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';
import { nameData, User } from 'src/pages/users/hooks/use-join-users';
import styled, { css } from 'styled-components';

import getSectionsVisibility from '../../utils/get-sections-visibility';
import DataContainer from './components/data-container';
import DataRow from './components/data-row';

type ViewBasicInfoProps = {
  user: User;
};

const ViewBasicInfo = ({ user }: ViewBasicInfoProps) => {
  const { t, allT } = useTranslation('pages.user-details');
  const userAttributes = user.attributes;
  const sectionsVisibility = getSectionsVisibility(user.identityDataAttributes);
  const showIdentity = sectionsVisibility.identity;
  const showAddress = sectionsVisibility.address;

  return (
    <DataGrid>
      <DataContainer
        headerIcon={IcoFileText224}
        title={t('user-info.basic.title')}
      >
        {user.identityDataAttributes.includes(UserDataAttribute.firstName) &&
          user.identityDataAttributes.includes(UserDataAttribute.lastName) && (
            <DataRow
              data={nameData(userAttributes)}
              title={allT('collected-data-options.name')}
            />
          )}
        {user.identityDataAttributes.includes(UserDataAttribute.email) && (
          <DataRow
            title={allT('collected-data-options.email')}
            data={userAttributes.email}
          />
        )}
        {user.identityDataAttributes.includes(
          UserDataAttribute.phoneNumber,
        ) && (
          <DataRow
            title={allT('collected-data-options.phone_number')}
            data={userAttributes.phoneNumber}
          />
        )}
      </DataContainer>
      {showIdentity && (
        <DataContainer
          headerIcon={IcoUserCircle24}
          title={t('user-info.identity.title')}
        >
          {user.identityDataAttributes.includes(UserDataAttribute.ssn9) && (
            <DataRow
              title={allT('collected-data-options.ssn9')}
              data={userAttributes.ssn9}
            />
          )}
          {user.identityDataAttributes.includes(UserDataAttribute.ssn4) && (
            <DataRow
              title={allT('collected-data-options.ssn4')}
              data={userAttributes.ssn4}
            />
          )}
          {user.identityDataAttributes.includes(UserDataAttribute.dob) && (
            <DataRow
              title={allT('collected-data-options.dob')}
              data={userAttributes.dob}
            />
          )}
        </DataContainer>
      )}
      {showAddress && (
        <Box
          sx={{
            gridRow: showIdentity ? '1 / span 2' : undefined,
            gridColumn: '2 / 2',
          }}
        >
          <DataContainer
            headerIcon={IcoBuilding24}
            title={t('user-info.address.title')}
          >
            {user.identityDataAttributes.includes(
              UserDataAttribute.country,
            ) && (
              <DataRow
                title={allT('user-data-attributes.country')}
                data={userAttributes.country}
              />
            )}
            {user.identityDataAttributes.includes(
              UserDataAttribute.addressLine1,
            ) && (
              <DataRow
                title={allT('user-data-attributes.address-line1')}
                data={userAttributes.addressLine1}
              />
            )}
            {user.identityDataAttributes.includes(
              UserDataAttribute.addressLine2,
            ) && (
              <DataRow
                data={userAttributes.addressLine2}
                title={allT('user-data-attributes.address-line2')}
              />
            )}
            {user.identityDataAttributes.includes(UserDataAttribute.city) && (
              <DataRow
                title={allT('user-data-attributes.city')}
                data={userAttributes.city}
              />
            )}
            {user.identityDataAttributes.includes(UserDataAttribute.zip) && (
              <DataRow
                title={allT('user-data-attributes.zip')}
                data={userAttributes.zip}
              />
            )}
            {user.identityDataAttributes.includes(UserDataAttribute.state) && (
              <DataRow
                title={allT('user-data-attributes.state')}
                data={userAttributes.state}
              />
            )}
          </DataContainer>
        </Box>
      )}
    </DataGrid>
  );
};

const DataGrid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]}px;
    grid-template-columns: repeat(2, 1fr);
  `};
`;

export default ViewBasicInfo;
