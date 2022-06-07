import IcoBuilding24 from 'icons/ico/ico-building-24';
import IcoFileText224 from 'icons/ico/ico-file-text-2-24';
import IcoUserCircle24 from 'icons/ico/ico-user-circle-24';
import React from 'react';
import { User } from 'src/pages/users/hooks/use-join-users';
import DataContainer from 'src/pages/users/pages/detail/components/data-container';
import styled, { css } from 'styled-components';

type BasicInfoProps = {
  user: User;
};

const BasicInfo = ({ user }: BasicInfoProps) => (
  <DataGrid>
    {/* TODO: distinguish between un-populated data and encrypted data */}
    {/* TODO: formatting for each type of data */}
    <DataContainer
      sx={{ gridArea: '1 / 1 / span 1 / span 1' }}
      HeaderIcon={IcoFileText224}
      header="Basic data"
      rows={[
        { title: 'Name', value: user.name },
        { title: 'Email', value: user.email },
        { title: 'Phone number', value: user.phoneNumber },
      ]}
    />
    <DataContainer
      sx={{ gridArea: '2 / 1 / span 1 / span 1' }}
      HeaderIcon={IcoUserCircle24}
      header="Identity data"
      rows={[
        { title: 'SSN', value: user.ssn },
        { title: 'Date of birth', value: user.dob },
      ]}
    />
    <DataContainer
      sx={{ gridArea: '1 / 2 / span 2 / span 1' }}
      HeaderIcon={IcoBuilding24}
      header="Address"
      rows={[
        { title: 'Country', value: user.country },
        { title: 'Address line 1', value: user.streetAddress },
        { title: 'Address line 2', value: user.streetAddress2 },
        { title: 'City', value: user.city },
        { title: 'Zip code', value: user.zip },
        { title: 'State', value: user.state },
      ]}
    />
  </DataGrid>
);

const DataGrid = styled.div`
  display: grid;
  grid-template: auto auto / repeat(2, minmax(0, 1fr));
  ${({ theme }) => css`
    gap: ${theme.spacing[5]}px;
  `};
`;

export default BasicInfo;
