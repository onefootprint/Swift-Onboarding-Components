import { IcoCode24 } from '@onefootprint/icons';
import type { Document, EntityVault } from '@onefootprint/types';
import { CodeBlock } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import CollapsibleSection from '../collapsible-section';
import getJsonKindText from './utils/get-json-kind-text';
import getRawJsonData from './utils/get-raw-json-data';

type RawJsonDataProps = {
  vault: EntityVault;
  document: Document;
};

const RawJsonData = ({ vault, document }: RawJsonDataProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset.documents.details.raw-json-data',
  });
  const rawJsonData = getRawJsonData(vault, document);
  if (!rawJsonData.length) return null;

  return rawJsonData.map(({ rawJsonKind, rawJsonData }) => (
    <CollapsibleSection key={rawJsonKind} icon={IcoCode24} title={getJsonKindText(rawJsonKind) as string}>
      <CodeBlock language="javascript" title={t('json')}>
        {rawJsonData}
      </CodeBlock>
    </CollapsibleSection>
  ));
};

export default RawJsonData;
