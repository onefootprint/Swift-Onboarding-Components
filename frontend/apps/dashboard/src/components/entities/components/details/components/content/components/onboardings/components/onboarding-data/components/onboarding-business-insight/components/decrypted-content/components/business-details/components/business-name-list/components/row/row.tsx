import { IcoInfo16 } from '@onefootprint/icons';
import { Badge, Tag, Tooltip } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import isNull from 'lodash/isNull';
import { useTranslation } from 'react-i18next';
import { EMPTY_VALUE, type FormattedName } from '../../../../../../../../onboarding-business-insight.types';

type RowProps = {
  businessName: FormattedName;
};

const Row = ({ businessName }: RowProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings' });
  const { name, sources, sourceSOSFilingId, submitted, verified, kind } = businessName;

  const getKindText = () => {
    if (kind === 'dba') return t('business-details.name.table.dba');
    if (kind === 'legal') return t('business-details.name.table.legal');
    return EMPTY_VALUE;
  };

  return (
    <>
      <td>
        <div className="flex items-center gap-2">
          <div
            className={cx('flex items-center gap-1 flex-shrink-1 w-full min-w-0', {
              'cursor-pointer': Boolean(sourceSOSFilingId),
            })}
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
          </div>
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
