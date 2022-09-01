import { useTranslation } from 'hooks';
import { IcoBuilding24, IcoFileText224, IcoUserCircle24 } from 'icons';
import React from 'react';
import { nameData, User } from 'src/pages/users/hooks/use-join-users';
import DataContainer from 'src/pages/users/pages/detail/components/data-container';
import styled, { css } from 'styled-components';
import { UserDataAttribute } from 'types';

import getSectionsVisibility from './utils/get-sections-visibility';

type BasicInfoProps = {
  user: User;
};

const BasicInfo = ({ user }: BasicInfoProps) => {
  const { t, allT } = useTranslation('pages.user-details');
  const userAttributes = user.attributes;
  const sectionsVisibility = getSectionsVisibility(user.identityDataAttributes);

  return (
    <DataGrid
      data-show-only-basic-data={
        !sectionsVisibility.address && !sectionsVisibility.identity
      }
    >
      {/* TODO: distinguish between un-populated data and encrypted data */}
      {/* TODO: formatting for each type of data */}
      <DataContainer
        sx={{ gridArea: '1 / 1 / span 1 / span 1' }}
        headerIcon={IcoFileText224}
        title={t('user-info.basic.title')}
        rows={[
          {
            title: allT('collected-data-options.name'),
            data: nameData(userAttributes),
            shouldShow: user.identityDataAttributes.includes(
              UserDataAttribute.firstName,
            ),
          },
          {
            title: allT('collected-data-options.email'),
            data: userAttributes.email,
            shouldShow: user.identityDataAttributes.includes(
              UserDataAttribute.email,
            ),
          },
          {
            title: allT('collected-data-options.phone_number'),
            data: userAttributes.phoneNumber,
            shouldShow: user.identityDataAttributes.includes(
              UserDataAttribute.phoneNumber,
            ),
          },
        ]}
      />
      {sectionsVisibility.identity && (
        <DataContainer
          sx={{
            gridArea: '1 / 2 / span 1 / span 1',
          }}
          headerIcon={IcoUserCircle24}
          title={t('user-info.identity.title')}
          rows={[
            {
              title: allT('collected-data-options.ssn9'),
              data: userAttributes.ssn9,
              shouldShow: user.identityDataAttributes.includes(
                UserDataAttribute.ssn9,
              ),
            },
            {
              title: allT('collected-data-options.ssn4'),
              data: userAttributes.ssn4,
              shouldShow: user.identityDataAttributes.includes(
                UserDataAttribute.ssn4,
              ),
            },
            {
              title: allT('collected-data-options.dob'),
              data: userAttributes.dob,
              shouldShow: user.identityDataAttributes.includes(
                UserDataAttribute.dob,
              ),
            },
          ]}
        />
      )}
      {sectionsVisibility.address && (
        <DataContainer
          sx={{
            gridArea: sectionsVisibility.identity
              ? '2 / 1 / span 1 / span 1'
              : '1 / 2 / span 1 / span 1',
          }}
          headerIcon={IcoBuilding24}
          title={t('user-info.address.title')}
          rows={[
            {
              title: allT('user-data-attributes.country'),
              data: userAttributes.country,
              shouldShow: user.identityDataAttributes.includes(
                UserDataAttribute.country,
              ),
            },
            {
              title: allT('user-data-attributes.address-line1'),
              data: userAttributes.addressLine1,
              shouldShow: user.identityDataAttributes.includes(
                UserDataAttribute.addressLine1,
              ),
            },
            {
              title: allT('user-data-attributes.address-line2'),
              data: userAttributes.addressLine2,
              shouldShow: user.identityDataAttributes.includes(
                UserDataAttribute.addressLine2,
              ),
            },
            {
              title: allT('user-data-attributes.city'),
              data: userAttributes.city,
              shouldShow: user.identityDataAttributes.includes(
                UserDataAttribute.city,
              ),
            },
            {
              title: allT('user-data-attributes.zip'),
              data: userAttributes.zip,
              shouldShow: user.identityDataAttributes.includes(
                UserDataAttribute.zip,
              ),
            },
            {
              title: allT('user-data-attributes.state'),
              data: userAttributes.state,
              shouldShow: user.identityDataAttributes.includes(
                UserDataAttribute.state,
              ),
            },
          ]}
        />
      )}
    </DataGrid>
  );
};

const DataGrid = styled.div`
  ${({ theme }) => css`
    &[data-show-only-basic-data='false'] {
      display: grid;
      gap: ${theme.spacing[5]}px;
      grid-template: auto auto / repeat(2, minmax(0, 1fr));
    }
  `};
`;

export default BasicInfo;
