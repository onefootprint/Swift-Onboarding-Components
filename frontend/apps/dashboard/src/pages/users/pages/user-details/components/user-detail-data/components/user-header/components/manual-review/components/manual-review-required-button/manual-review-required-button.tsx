import { useTranslation } from '@onefootprint/hooks';
import { ReviewStatus, UserStatus } from '@onefootprint/types';
import { Button, Dropdown } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type ManualReviewRequiredButtonProps = {
  status: UserStatus;
  onOpenDialog: (reviewStatus: ReviewStatus) => void;
};

const ManualReviewRequiredButton = ({
  status,
  onOpenDialog,
}: ManualReviewRequiredButtonProps) => {
  const { t } = useTranslation('pages.user-details.manual-review');
  const pass = t(`status.${ReviewStatus.pass}`);
  const fail = t(`status.${ReviewStatus.fail}`);

  return (
    <Dropdown.Root>
      <DropdownTrigger>
        <Button size="small">{t('button.review')}</Button>
      </DropdownTrigger>
      <Dropdown.Portal>
        <DropdownContent align="end">
          <DropdownItem
            onClick={() => {
              onOpenDialog(ReviewStatus.pass);
            }}
          >
            <div>
              {status === UserStatus.verified
                ? t('dropdown.keep-as', { status: pass })
                : t('dropdown.mark-as', { status: pass })}
            </div>
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              onOpenDialog(ReviewStatus.fail);
            }}
          >
            <div>
              {status === UserStatus.failed
                ? t('dropdown.keep-as', { status: fail })
                : t('dropdown.mark-as', { status: fail })}
            </div>
          </DropdownItem>
        </DropdownContent>
      </Dropdown.Portal>
    </Dropdown.Root>
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
export default ManualReviewRequiredButton;
