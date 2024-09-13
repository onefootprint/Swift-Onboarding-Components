import { EntityKind, EntityStatus, ReviewStatus } from '@onefootprint/types';
import { Button, Dropdown } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

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
      <Dropdown.Trigger asChild disabled={disabled}>
        <Button size="compact">
          {kind === EntityKind.person ? t('button.review-person') : t('button.review-business')}
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content align="end" sideOffset={12} minWidth="220px">
          <Dropdown.Group>
            <Dropdown.Item
              onClick={() => {
                onSelect(ReviewStatus.pass);
              }}
            >
              <div>
                {status === EntityStatus.pass
                  ? t('dropdown.keep-as', { status: pass })
                  : t('dropdown.mark-as', { status: pass })}
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                onSelect(ReviewStatus.fail);
              }}
            >
              <div>
                {status === EntityStatus.failed
                  ? t('dropdown.keep-as', { status: fail })
                  : t('dropdown.mark-as', { status: fail })}
              </div>
            </Dropdown.Item>
          </Dropdown.Group>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};

export default ManualReviewTrigger;
