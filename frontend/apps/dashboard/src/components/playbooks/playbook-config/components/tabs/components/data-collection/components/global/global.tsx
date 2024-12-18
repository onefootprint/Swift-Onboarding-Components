import type { IdDocKind } from '@onefootprint/request-types/dashboard';
import { useTranslation } from 'react-i18next';
import useIdDocList from 'src/hooks/use-id-doc-list';

type GlobalProps = {
  global?: Array<IdDocKind>;
  hasSelfie?: boolean;
};

const Global = ({ global = [], hasSelfie = false }: GlobalProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'data-collection' });
  const getIdDocList = useIdDocList();
  const documentTypes = getIdDocList(global);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-label-2 text-secondary">{t('gov-docs.global.scans')}</p>
      <div className="flex flex-row gap-2 pl-2">
        {documentTypes.length === 0 ? (
          <p className="text-body-2 text-tertiary">{t('gov-docs.none')}</p>
        ) : (
          <div className="flex flex-row gap-2">
            <span className="text-body-2 text-secondary">{documentTypes.join(', ')}</span>
            {hasSelfie && (
              <>
                <span className="text-body-2 text-secondary">+</span>
                <span className="text-body-2 text-secondary">{t('gov-docs.selfie')}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Global;
