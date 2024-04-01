import { EntityKind, EntityStatus, ReviewStatus } from '@onefootprint/types';
import { Button, Dropdown } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type ManualReviewTriggerProps = {
  kind: EntityKind;
  status: EntityStatus;
  onSelect: (reviewStatus: ReviewStatus) => void;
  disabled?: boolean;
};

const ManualReviewTrigger = ({
  kind,
  status,
  onSelect,
  disabled,
}: ManualReviewTriggerProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.manual-review',
  });
  const pass = t(`status.${ReviewStatus.pass}` as ParseKeys<'common'>);
  const fail = t(`status.${ReviewStatus.fail}` as ParseKeys<'common'>);

  return (
    <Dropdown.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownTrigger asChild disabled={disabled}>
        <Button>
          {kind === EntityKind.person
            ? t('button.review-person')
            : t('button.review-business')}
        </Button>
      </DropdownTrigger>
      {dropdownOpen && (
        <Dropdown.Portal forceMount>
          <DropdownContent align="end" sideOffset={12} forceMount>
            <DropdownItem
              onClick={e => {
                e.preventDefault();
                onSelect(ReviewStatus.pass);
                setDropdownOpen(false);
              }}
            >
              <div>
                {status === EntityStatus.pass
                  ? t('dropdown.keep-as', { status: pass })
                  : t('dropdown.mark-as', { status: pass })}
              </div>
            </DropdownItem>
            <DropdownItem
              onClick={e => {
                e.preventDefault();
                onSelect(ReviewStatus.fail);
                setDropdownOpen(false);
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
      )}
    </Dropdown.Root>
  );
};

const DropdownTrigger = styled(Dropdown.Trigger)`
  all: unset;
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

export default ManualReviewTrigger;
