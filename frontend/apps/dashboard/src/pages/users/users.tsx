import IcoLock16 from 'icons/ico/ico-lock-16';
import IcoSearch16 from 'icons/ico/ico-search-16';
import React, { useEffect, useState } from 'react';
import Modal, { ModalCloseEvent } from 'src/components/modal';
import { Row, Table } from 'src/components/table';
import useDecryptUser, {
  DecryptedUserAttributes,
  DecryptUserRequest,
} from 'src/pages/users/hooks/use-decrypt-user';
import { useFilters } from 'src/pages/users/hooks/use-filters';
import useGetOnboardings, {
  OnboardingStatus,
} from 'src/pages/users/hooks/use-get-onboardings';
import useJoinUsers, { User } from 'src/pages/users/hooks/use-join-users';
import styled, { css, UIState } from 'styled';
import {
  Badge,
  Box,
  Button,
  Container,
  Select,
  SelectOption,
  TextInput,
  Typography,
} from 'ui';
import { useMap } from 'usehooks-ts';

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

const columns = [
  { text: 'Name', width: '12.5%' },
  { text: 'Footprint Token', width: '20%' },
  { text: 'Status', width: '12.5%' },
  { text: 'Email', width: '12.5%' },
  { text: 'SSN', width: '12.5%' },
  { text: 'Phone Number', width: '12.5%' },
  { text: 'Date', width: '17.5%' },
];

const EncryptedCell = () => (
  <Box sx={{ display: 'flex' }}>
    <IcoLockContainer />
    <Typography variant="body-3" color="primary" noSelect>
      •••••••••
    </Typography>
  </Box>
);

type FieldOrPlaceholderProps = {
  value: string | undefined;
};

const FieldOrPlaceholder = ({ value }: FieldOrPlaceholderProps) =>
  value ? (
    <Typography variant="body-3" color="primary" noWrap>
      {value}
    </Typography>
  ) : (
    <EncryptedCell />
  );

const UsersFilter = () => {
  const { query, setFilter } = useFilters();
  const [selectedOption, setSelectedOption] = useState<
    SelectOption | null | undefined
  >(undefined);
  const [showModal, setShowModal] = useState(false);

  // Any time the modal is opened, recompute what the currently displayed status should be based
  // on the querystring
  useEffect(() => {
    // TODO this should be much simpler... can the selectedOption be just a value rather than
    // a SelectOption?
    const currentStatus =
      query.status && query.status in statusToDisplayText
        ? ({
            value: query.status,
            label: statusToDisplayText[query.status as OnboardingStatus],
          } as SelectOption)
        : undefined;
    setSelectedOption(currentStatus);
  }, [query, showModal]);

  const handleCloseModal = (type: ModalCloseEvent) => {
    if (type === ModalCloseEvent.Primary) {
      setFilter({
        status: selectedOption?.value as string,
      });
    } else if (type === ModalCloseEvent.Secondary) {
      // Clear the filter
      setFilter({
        status: undefined,
      });
    }
    setShowModal(false);
  };

  return (
    <>
      {showModal && (
        <Modal
          size="compact"
          headerText="Filters"
          primaryButtonText="Apply"
          secondaryButtonText="Clear"
          onClose={handleCloseModal}
        >
          <Select
            label="Status"
            options={[
              // TODO share these with the enum values we define
              { label: 'Verified', value: OnboardingStatus.verified },
              { label: 'Incomplete', value: OnboardingStatus.incomplete },
              { label: 'Manual review', value: OnboardingStatus.manualReview },
              { label: 'Processing', value: OnboardingStatus.processing },
              { label: 'Failed', value: OnboardingStatus.failed },
            ]}
            selectedOption={selectedOption}
            onSelect={option => {
              setSelectedOption(option);
            }}
          />
        </Modal>
      )}
      <FilterButtonContainer>
        <Button
          size="small"
          variant="secondary"
          onClick={() => setShowModal(true)}
        >
          Filters
        </Button>
      </FilterButtonContainer>
    </>
  );
};

const Users = () => {
  const [decryptedUsers, { set: setDecryptedUser }] = useMap<
    String,
    DecryptedUserAttributes
  >(new Map());

  const decryptUserMutation = useDecryptUser();
  const getOnboardings = useGetOnboardings();

  const { query, setFilter } = useFilters();
  const [searchText, setSearchText] = useState<string>();

  // Bind the contents of the search text box to the querystring
  useEffect(() => {
    setSearchText(query.fingerprint || '');
  }, [query]);

  // Join the onboarding list results with any decrypted user data
  const users = useJoinUsers(getOnboardings.data, decryptedUsers);

  const loadEncryptedAttributes = (footprintUserId: string) => {
    const decryptUserRequest: DecryptUserRequest = {
      footprintUserId,
      attributes: ['first_name', 'last_name', 'phone_number', 'email', 'ssn'],
    };
    decryptUserMutation
      .mutateAsync(decryptUserRequest)
      .then((decryptedUserAttributes: DecryptedUserAttributes) => {
        setDecryptedUser(footprintUserId, decryptedUserAttributes);
      });
  };

  return (
    <Container>
      <SearchTextInput
        placeholder="Search (exact match)..."
        prefixElement={<IcoSearchContainer />}
        suffixElement={<UsersFilter />}
        value={searchText}
        onChangeText={(text: string) =>
          setFilter({
            fingerprint: text,
          })
        }
      />
      <Table
        items={users}
        isLoading={getOnboardings.isLoading}
        getKeyForRow={(item: User) => item.footprintUserId}
        onRowClick={(item: User) => {
          loadEncryptedAttributes(item.footprintUserId);
        }}
        columns={columns}
        renderTr={({ item }: Row<User>) => (
          <>
            <td>
              <FieldOrPlaceholder value={item.name} />
            </td>
            <td>
              <Typography variant="body-3">{item.footprintUserId}</Typography>
            </td>
            <td>
              <Badge variant={statusToBadgeVariant[item.status]}>
                {statusToDisplayText[item.status]}
              </Badge>
            </td>
            <td>
              <FieldOrPlaceholder value={item.email} />
            </td>
            <td>
              <FieldOrPlaceholder value={item.ssn} />
            </td>
            <td>
              <FieldOrPlaceholder value={item.phoneNumber} />
            </td>
            <td>
              <Typography variant="body-3" color="primary">
                {/* TODO better formatting utils */}
                {new Date(item.initiatedAt).toLocaleString('en-us', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </Typography>
            </td>
          </>
        )}
      />
    </Container>
  );
};

const SearchTextInput = styled(TextInput)`
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  height: 100%;
  ${({ theme }) => css`
    padding-top: ${theme.spacing[5]}px;
    padding-bottom: ${theme.spacing[5]}px;
  `};
`;

const IcoLockContainer = styled(IcoLock16)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[2]}px;
  `};
`;

const IcoSearchContainer = styled(IcoSearch16)`
  ${({ theme }) => css`
    margin-left: ${theme.spacing[6]}px;
  `};
`;

const FilterButtonContainer = styled.div`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[6]}px;
  `};
`;

export default Users;
