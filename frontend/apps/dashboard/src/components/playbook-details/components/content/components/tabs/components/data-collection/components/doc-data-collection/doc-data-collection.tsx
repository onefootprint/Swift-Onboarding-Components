import type { OnboardingConfig } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import AdditionalDocs from '../additional-docs';
import DocTypesAndCountries from './components/doc-types-and-countries';

type DocDataCollectionProps = { playbook: OnboardingConfig };

const DocDataCollection = ({
  playbook: { documentTypesAndCountries, documentsToCollect = [], mustCollectData = [] },
}: DocDataCollectionProps) => {
  const hasSelfie = mustCollectData.includes('document_and_selfie');

  return (
    <Stack gap={7} direction="column">
      {documentTypesAndCountries && (
        <DocTypesAndCountries documentTypesAndCountries={documentTypesAndCountries} hasSelfie={hasSelfie} />
      )}
      {documentsToCollect && documentsToCollect.length > 0 && (
        <AdditionalDocs variant="sectioned" docs={documentsToCollect} />
      )}
    </Stack>
  );
};

export default DocDataCollection;
