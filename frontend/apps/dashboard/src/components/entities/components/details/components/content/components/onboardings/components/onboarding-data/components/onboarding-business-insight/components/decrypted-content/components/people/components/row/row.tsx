import { IcoInfo16 } from '@onefootprint/icons';
import { Badge, Tag, Tooltip } from '@onefootprint/ui';
import isNull from 'lodash/isNull';
import { useTranslation } from 'react-i18next';
import type { FormattedPerson } from '../../../../../../onboarding-business-insight.types';

type RowProps = {
  person: FormattedPerson;
};

const Row = ({ person }: RowProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings' });
  const { name, role, submitted, associationVerified, sources } = person;

  return (
    <>
      <td>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 flex-shrink-1 w-full min-w-0">
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
            {!isNull(associationVerified) && (
              <Badge variant={associationVerified ? 'success' : 'error'}>
                {associationVerified ? t('business-shared.tags.verified') : t('business-shared.tags.not-verified')}
              </Badge>
            )}
          </div>
        </div>
      </td>
      <td>{role}</td>
    </>
  );
};

export default Row;
