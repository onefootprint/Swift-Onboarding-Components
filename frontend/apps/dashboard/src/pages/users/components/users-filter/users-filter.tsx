import React, { useEffect, useState } from 'react';
import Modal, { ModalCloseEvent } from 'src/components/modal';
import { useFilters } from 'src/pages/users/hooks/use-filters';
import {
  OnboardingStatus,
  statusToDisplayText,
} from 'src/pages/users/hooks/use-get-onboardings';
import styled, { css } from 'styled-components';
import { Button, Select, SelectOption } from 'ui';

const UsersFilter = () => {
  const { query, setFilter } = useFilters();
  const [selectedOption, setSelectedOption] = useState<
    SelectOption | null | undefined
  >();
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
          secondaryButtonVariant="link"
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
            value={selectedOption ? selectedOption.value : null}
            onChange={option => {
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

const FilterButtonContainer = styled.div`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[6]}px;
  `};
`;

export default UsersFilter;
