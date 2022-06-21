import React, { useEffect, useState } from 'react';
import { useFilters } from 'src/pages/users/hooks/use-filters';
import { OnboardingStatus, statusToDisplayText } from 'src/types';
import styled, { css } from 'styled-components';
import { Button, Dialog, Select, SelectOption } from 'ui';

const UsersFilter = () => {
  const { query, setFilter } = useFilters();
  const [selectedOption, setSelectedOption] = useState<
    SelectOption | null | undefined
  >();
  const [showDialog, setShowDialog] = useState(false);

  // Any time the dialog is opened, recompute what the currently displayed status should be based
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
  }, [query, showDialog]);

  const handleApplyClick = () => {
    setFilter({
      status: selectedOption?.value as string,
    });
    setShowDialog(false);
  };
  const handleClearClick = () => {
    // Clear the filter
    setFilter({
      status: undefined,
    });
    setShowDialog(false);
  };

  return (
    <>
      <Dialog
        size="compact"
        title="Filters"
        primaryButton={{
          label: 'Apply',
          onClick: handleApplyClick,
        }}
        linkButton={{
          label: 'Clear',
          onClick: handleClearClick,
        }}
        onClose={() => setShowDialog(false)}
        open={showDialog}
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
      </Dialog>
      <FilterButtonContainer>
        <Button
          size="small"
          variant="secondary"
          onClick={() => setShowDialog(true)}
        >
          Filters
        </Button>
      </FilterButtonContainer>
    </>
  );
};

const FilterButtonContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  ${({ theme }) => css`
    margin-right: ${theme.spacing[6]}px;
  `};
`;

export default UsersFilter;
