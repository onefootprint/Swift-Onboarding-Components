import { EntityKind, EntityStatus, ReviewStatus } from '@onefootprint/types';
import { Button, Dropdown } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type ManualReviewTriggerProps = {
  kind: EntityKind;
  status: EntityStatus;
  onSelect: (reviewStatus: ReviewStatus) => void;
  disabled?: boolean;
};

const ManualReviewTrigger = ({ kind, status, onSelect, disabled }: ManualReviewTriggerProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.manual-review',
  });
  const pass = t(`status.${ReviewStatus.pass}` as ParseKeys<'common'>);
  const fail = t(`status.${ReviewStatus.fail}` as ParseKeys<'common'>);

  return (
    <Dropdown.Root>
      <DropdownTrigger asChild disabled={disabled}>
        <Button>{kind === EntityKind.person ? t('button.review-person') : t('button.review-business')}</Button>
      </DropdownTrigger>
      <DropdownContent align="end" sideOffset={12}>
        <DropdownItem
          onClick={() => {
            onSelect(ReviewStatus.pass);
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
            onSelect(ReviewStatus.fail);
          }}
        >
          <div>
            {status === EntityStatus.failed
              ? t('dropdown.keep-as', { status: fail })
              : t('dropdown.mark-as', { status: fail })}
          </div>
        </DropdownItem>
      </DropdownContent>
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
