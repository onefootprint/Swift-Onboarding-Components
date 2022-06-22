import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useFilters } from 'src/pages/users/hooks/use-filters';
import { OnboardingStatus, statusToDisplayText } from 'src/types';
import styled, { css } from 'styled-components';
import { Box, Button, Checkbox, Dialog, Typography } from 'ui';

type FormValues = {
  onboardingStatuses: Array<OnboardingStatus>;
};

const UsersFilter = () => {
  const { query, setFilter } = useFilters();

  const [showDialog, setShowDialog] = useState(false);
  const { getValues, register, setValue } = useForm<FormValues>({
    defaultValues: {
      onboardingStatuses: [],
    },
  });

  const openDialog = () => {
    // Refresh the state of the dialog and open it
    const statusesStr = query.statuses || '';
    const selectedFields = statusesStr ? statusesStr.split(',') : [];
    setValue('onboardingStatuses', selectedFields as OnboardingStatus[]);
    setShowDialog(true);
  };

  const handleApplyClick = () => {
    setFilter({
      statuses: getValues('onboardingStatuses').join(','),
    });
    setShowDialog(false);
  };
  const handleClearClick = () => {
    // Clear the filter
    setValue('onboardingStatuses', []);
    setFilter({
      statuses: undefined,
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
        <Typography variant="label-1" sx={{ marginBottom: 6 }}>
          Status
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {[
            OnboardingStatus.verified,
            OnboardingStatus.incomplete,
            OnboardingStatus.manualReview,
            OnboardingStatus.processing,
            OnboardingStatus.failed,
          ].map(value => (
            <Checkbox
              label={statusToDisplayText[value]}
              key={value}
              value={value}
              {...register('onboardingStatuses')}
            />
          ))}
        </Box>
      </Dialog>
      <FilterButtonContainer>
        <Button size="small" variant="secondary" onClick={openDialog}>
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
