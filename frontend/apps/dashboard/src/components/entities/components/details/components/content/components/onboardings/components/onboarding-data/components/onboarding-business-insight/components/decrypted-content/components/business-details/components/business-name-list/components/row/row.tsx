import { IcoInfo16 } from '@onefootprint/icons';
import { Badge, Tag, Tooltip } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import isNull from 'lodash/isNull';
import { useTranslation } from 'react-i18next';
import { EMPTY_VALUE } from '../../../../../../../../constants';
import type { FormattedName } from '../../../../../../../../onboarding-business-insight.types';

type RowProps = {
  businessName: FormattedName;
  onOpen: (id: string) => void;
};

const Row = ({ businessName: { name, sources, sourceSOSFilingId, submitted, verified, kind }, onOpen }: RowProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings' });

  const getKindText = () => {
    if (kind === 'dba') return t('business-details.name.table.dba');
    if (kind === 'legal') return t('business-details.name.table.legal');
    return EMPTY_VALUE;
  };

  const handleClick = () => {
    if (!sourceSOSFilingId) return;
    onOpen(sourceSOSFilingId);
  };

  return (
    <>
      <td>
        <div className="flex items-center gap-2">
          <button
            className={cx('flex items-center gap-1 flex-shrink-1 w-full min-w-0', {
              'cursor-pointer': Boolean(sourceSOSFilingId),
              'cursor-default': !sourceSOSFilingId,
            })}
            onClick={handleClick}
            type="button"
          >
            <p className="text-body-3 truncate">{name}</p>
            {sources && (
              <Tooltip
                text={t('business-details.name.table.source', {
                  sources,
                })}
                position="bottom"
                alignment="start"
              >
                <IcoInfo16 />
              </Tooltip>
            )}
          </button>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isNull(submitted) && (
              <Tag>{submitted ? t('business-shared.tags.submitted') : t('business-shared.tags.not-submitted')}</Tag>
            )}
            {!isNull(verified) && (
              <Badge variant={verified ? 'success' : 'error'}>
                {verified ? t('business-shared.tags.verified') : t('business-shared.tags.not-verified')}
              </Badge>
            )}
          </div>
        </div>
      </td>
      <td>{getKindText()}</td>
    </>
  );
};

export default Row;
