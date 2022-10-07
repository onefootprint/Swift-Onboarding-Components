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
import RiskSignalsOverview from '../risk-signals-overview';
import DataRow from './components/data-row';
import DataSection from './components/data-section';

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
      <DataSection
        iconComponent={IcoFileText224}
        renderFooter={() => (
          <RiskSignalsOverview
            high={[]}
            medium={[
              {
                id: '1',
                severity: 'medium',
                scope: 'Identity',
                note: 'High Risk Email Domain',
                noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
              },
              {
                id: '2',
                severity: 'medium',
                scope: 'Phone number',
                note: 'VoIP Number',
                noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
              },
            ]}
            low={[]}
          />
        )}
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
      </DataSection>
      {showIdentity && (
        <DataSection
          iconComponent={IcoUserCircle24}
          renderFooter={() => (
            <RiskSignalsOverview
              high={[
                {
                  id: '1',
                  severity: 'high',
                  scope: 'Identity',
                  note: 'SSN Issued Prior to DOB',
                  noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
                },
              ]}
              medium={[
                {
                  id: '2',
                  severity: 'medium',
                  scope: 'Identity',
                  note: 'SSN tied to multiple names',
                  noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
                },
              ]}
              low={[]}
            />
          )}
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
        </DataSection>
      )}
      {showAddress && (
        <Box
          sx={{
            gridRow: showIdentity ? '1 / span 2' : undefined,
            gridColumn: '2 / 2',
          }}
        >
          <DataSection
            renderFooter={() => (
              <RiskSignalsOverview
                high={[
                  {
                    id: '1',
                    severity: 'high',
                    scope: 'Address',
                    note: 'Warm Address Alert',
                    noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
                  },
                ]}
                medium={[
                  {
                    id: '2',
                    severity: 'medium',
                    scope: 'Address',
                    note: 'Street Name Does Not Match',
                    noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
                  },
                ]}
                low={[
                  {
                    id: '3',
                    severity: 'low',
                    scope: 'Address',
                    note: 'Zip Code Does Not Match',
                    noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
                  },
                ]}
              />
            )}
            iconComponent={IcoBuilding24}
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
          </DataSection>
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
