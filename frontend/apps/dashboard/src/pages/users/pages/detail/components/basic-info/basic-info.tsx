import IcoBuilding24 from 'icons/ico/ico-building-24';
import IcoFileText224 from 'icons/ico/ico-file-text-2-24';
import IcoUserCircle24 from 'icons/ico/ico-user-circle-24';
import React from 'react';
import { nameData, User } from 'src/pages/users/hooks/use-join-users';
import DataContainer from 'src/pages/users/pages/detail/components/data-container';
import styled, { css } from 'styled-components';

type BasicInfoProps = {
  user: User;
};

const BasicInfo = ({ user }: BasicInfoProps) => {
  const userAttributes = user.attributes;
  return (
    <DataGrid>
      {/* TODO: distinguish between un-populated data and encrypted data */}
      {/* TODO: formatting for each type of data */}
      <DataContainer
        sx={{ gridArea: '1 / 1 / span 1 / span 1' }}
        HeaderIcon={IcoFileText224}
        header="Basic data"
        rows={[
          { title: 'Name', data: nameData(userAttributes) },
          { title: 'Email', data: userAttributes.email },
          {
            title: 'Phone number',
            data: userAttributes.phoneNumber,
          },
        ]}
      />
      <DataContainer
        sx={{ gridArea: '2 / 1 / span 1 / span 1' }}
        HeaderIcon={IcoUserCircle24}
        header="Identity data"
        rows={[
          { title: 'SSN', data: userAttributes.ssn9 || userAttributes.ssn4 },
          { title: 'Date of birth', data: userAttributes.dob },
        ]}
      />
      <DataContainer
        sx={{ gridArea: '1 / 2 / span 2 / span 1' }}
        HeaderIcon={IcoBuilding24}
        header="Address"
        rows={[
          { title: 'Country', data: userAttributes.country },
          {
            title: 'Address line 1',
            data: userAttributes.addressLine1,
          },
          {
            title: 'Address line 2',
            data: userAttributes.addressLine2,
          },
          { title: 'City', data: userAttributes.city },
          { title: 'Zip code', data: userAttributes.zip },
          { title: 'State', data: userAttributes.state },
        ]}
      />
    </DataGrid>
  );
};

const DataGrid = styled.div`
  display: grid;
  grid-template: auto auto / repeat(2, minmax(0, 1fr));
  ${({ theme }) => css`
    gap: ${theme.spacing[5]}px;
  `};
`;

export default BasicInfo;
