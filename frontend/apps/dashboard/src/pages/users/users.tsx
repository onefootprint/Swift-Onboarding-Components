import IcoLock16 from 'icons/ico/ico-lock-16';
import IcoSearch16 from 'icons/ico/ico-search-16';
import React from 'react';
import { Row, Table, Th } from 'src/components/table';
import useGetOnboardings, {
  Onboarding,
  OnboardingStatus,
} from 'src/pages/users/hooks/use-get-onboardings';
import styled, { css, UIState } from 'styled';
import { Badge, Box, TextInput, Typography } from 'ui';

const statusToBadgeVariant: Record<OnboardingStatus, UIState> = {
  [OnboardingStatus.verified]: 'success',
  [OnboardingStatus.processing]: 'neutral',
  [OnboardingStatus.manualReview]: 'error',
  [OnboardingStatus.incomplete]: 'warning',
  [OnboardingStatus.failed]: 'error',
};

const statusToDisplayText = {
  [OnboardingStatus.verified]: 'Verified',
  [OnboardingStatus.processing]: 'Processing',
  [OnboardingStatus.manualReview]: 'Manual review',
  [OnboardingStatus.incomplete]: 'Incomplete',
  [OnboardingStatus.failed]: 'Failed',
};

const TableHeader = () => (
  <>
    <Th>
      <Typography variant="body-3" color="secondary">
        NAME
      </Typography>
    </Th>
    <Th>
      <Typography variant="body-3" color="secondary">
        FOOTPRINT TOKEN
      </Typography>
    </Th>
    <Th>
      <Typography variant="body-3" color="secondary">
        STATUS
      </Typography>
    </Th>
    <Th>
      <Typography variant="body-3" color="secondary">
        EMAIL
      </Typography>
    </Th>
    <Th>
      <Typography variant="body-3" color="secondary">
        SSN
      </Typography>
    </Th>
    <Th>
      <Typography variant="body-3" color="secondary">
        PHONE NUMBER
      </Typography>
    </Th>
    <Th>
      <Typography variant="body-3" color="secondary">
        DATE
      </Typography>
    </Th>
  </>
);

const EncryptedCell = () => (
  <>
    <MarginIcoLock16 />
    <Typography variant="body-3" color="primary">
      •••••••••
    </Typography>
  </>
);

const Users = () => {
  const getOnboardings = useGetOnboardings();

  return (
    <>
      <Box>
        <IcoSearch16 />
        <TextInput placeholder="Search (exact match)..." />
      </Box>
      <Table
        items={getOnboardings.data}
        isLoading={getOnboardings.isLoading}
        getKeyForRow={(item: Onboarding) => item.footprintUserId}
        renderHeader={() => <TableHeader />}
        renderRow={({ item }: Row<Onboarding>) => (
          <>
            <td>
              <TableCell>
                <EncryptedCell />
              </TableCell>
            </td>
            <td>
              <TableCell>
                <Typography variant="body-3">{item.footprintUserId}</Typography>
              </TableCell>
            </td>
            <td>
              <TableCell>
                <Badge variant={statusToBadgeVariant[item.status]}>
                  {statusToDisplayText[item.status]}
                </Badge>
              </TableCell>
            </td>
            <td>
              <TableCell>
                <EncryptedCell />
              </TableCell>
            </td>
            <td>
              <TableCell>
                <EncryptedCell />
              </TableCell>
            </td>
            <td>
              <TableCell>
                <EncryptedCell />
              </TableCell>
            </td>
            <td>
              <TableCell>
                <Typography variant="body-3" color="primary">
                  {/* TODO better formatting utils */}
                  {new Date(item.createdAt).toLocaleString('en-us', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </Typography>
              </TableCell>
            </td>
          </>
        )}
      />
    </>
  );
};

const MarginIcoLock16 = styled(IcoLock16)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[2]}px;
  `};
`;

const TableCell = styled.div`
  display: flex;
`;

export default Users;
