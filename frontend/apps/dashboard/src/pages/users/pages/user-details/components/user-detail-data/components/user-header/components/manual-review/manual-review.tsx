import { useTranslation } from '@onefootprint/hooks';
import { Button, Dropdown } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import ManualReviewDialog from './components/manual-review-dialog';
import ReviewStatus from './manual-review.types';

const ManualReview = () => {
  const { t } = useTranslation('pages.user-details.manual-review');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState<ReviewStatus | undefined>();

  return (
    <>
      <Dropdown.Root>
        <DropdownTrigger>
          <Button size="small" variant="secondary">
            {t('button.label')}
          </Button>
        </DropdownTrigger>
        <Dropdown.Portal>
          <DropdownContent>
            <DropdownItem
              onClick={() => {
                setStatus(ReviewStatus.verified);
                setDialogOpen(true);
              }}
            >
              <div>{t(`status.${ReviewStatus.verified}`)}</div>
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                setStatus(ReviewStatus.notVerified);
                setDialogOpen(true);
              }}
            >
              <div>{t(`status.${ReviewStatus.notVerified}`)}</div>
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                setStatus(ReviewStatus.doNotOnboard);
                setDialogOpen(true);
              }}
            >
              <div>{t(`status.${ReviewStatus.doNotOnboard}`)}</div>
            </DropdownItem>
          </DropdownContent>
        </Dropdown.Portal>
      </Dropdown.Root>
      {status && (
        <ManualReviewDialog
          status={status}
          open={dialogOpen}
          onClose={() => {
            setStatus(undefined);
            setDialogOpen(false);
          }}
        />
      )}
    </>
  );
};

const DropdownTrigger = styled(Dropdown.Trigger)`
  width: unset;
`;

const DropdownContent = styled(Dropdown.Content)`
  width: 220px;
`;

const DropdownItem = styled(Dropdown.Item)`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} ${theme.spacing[5]};

    div {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `};
`;

export default ManualReview;
