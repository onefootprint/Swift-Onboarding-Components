import { EntityKind, EntityStatus, ReviewStatus } from '@onefootprint/types';
import { Button, Dropdown } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

type ManualReviewTriggerProps = {
  kind: EntityKind;
  status: EntityStatus;
  onSelect: (reviewStatus: ReviewStatus) => void;
  disabled?: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

const ManualReviewTrigger = ({ kind, status, onSelect, disabled, onOpenChange, open }: ManualReviewTriggerProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'manual-review',
  });
  const kindText = kind === EntityKind.person ? t('kind.user') : t('kind.business');
  const pass = t(`status.${ReviewStatus.pass}` as ParseKeys<'common'>);
  const fail = t(`status.${ReviewStatus.fail}` as ParseKeys<'common'>);

  return (
    <Dropdown.Root open={open} onOpenChange={onOpenChange}>
      <Dropdown.Trigger asChild disabled={disabled}>
        <Button size="compact">{t('button.review', { kindText })}</Button>
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
                  ? t('dropdown.keep-as', { kindText, status: pass })
                  : t('dropdown.mark-as', { kindText, status: pass })}
              </div>
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => {
                onSelect(ReviewStatus.fail);
              }}
            >
              <div>
                {status === EntityStatus.failed
                  ? t('dropdown.keep-as', { kindText, status: fail })
                  : t('dropdown.mark-as', { kindText, status: fail })}
              </div>
            </Dropdown.Item>
          </Dropdown.Group>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};

export default ManualReviewTrigger;
