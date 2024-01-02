import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { EntityKind, EntityStatus, ReviewStatus } from '@onefootprint/types';
import { Button, Dropdown } from '@onefootprint/ui';
import React from 'react';

import { useEntityContext } from '@/entity/hooks/use-entity-context';

type ManualReviewRequiredButtonProps = {
  status: EntityStatus;
  onOpenDialog: (reviewStatus: ReviewStatus) => void;
};

const ManualReviewRequiredButton = ({
  status,
  onOpenDialog,
}: ManualReviewRequiredButtonProps) => {
  const { t } = useTranslation('pages.entity.manual-review');
  const { kind } = useEntityContext();
  const pass = t(`status.${ReviewStatus.pass}`);
  const fail = t(`status.${ReviewStatus.fail}`);

  return (
    <Dropdown.Root>
      <DropdownTrigger asChild>
        <Button size="small">
          {kind === EntityKind.person
            ? t('button.review-person')
            : t('button.review-business')}
        </Button>
      </DropdownTrigger>
      <Dropdown.Portal>
        <DropdownContent align="end" sideOffset={12}>
          <DropdownItem
            onClick={() => {
              onOpenDialog(ReviewStatus.pass);
            }}
          >
            <div>
              {status === EntityStatus.pass
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
              {status === EntityStatus.failed
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
