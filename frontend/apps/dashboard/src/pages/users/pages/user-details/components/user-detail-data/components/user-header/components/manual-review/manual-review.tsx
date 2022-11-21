import { useTranslation } from '@onefootprint/hooks';
import { ReviewStatus } from '@onefootprint/types';
import { Button, Dropdown } from '@onefootprint/ui';
import React, { useState } from 'react';
import { User } from 'src/pages/users/types/user.types';
import styled, { css } from 'styled-components';

import ManualReviewDialog from './components/manual-review-dialog';

type ManualReviewProps = {
  user: User;
};

const ManualReview = ({ user }: ManualReviewProps) => {
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
                setStatus(ReviewStatus.pass);
                setDialogOpen(true);
              }}
            >
              <div>{t(`status.${ReviewStatus.pass}`)}</div>
            </DropdownItem>
            <DropdownItem
              onClick={() => {
                setStatus(ReviewStatus.fail);
                setDialogOpen(true);
              }}
            >
              <div>{t(`status.${ReviewStatus.fail}`)}</div>
            </DropdownItem>
          </DropdownContent>
        </Dropdown.Portal>
      </Dropdown.Root>
      {status && (
        <ManualReviewDialog
          user={user}
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
