import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import AdditionalDocs from '../additional-docs';
import DocTypesAndCountries from './components/doc-types-and-countries';

type DocDataCollectionProps = {
  playbook: OnboardingConfiguration;
};

const DocDataCollection = ({
  playbook: { documentTypesAndCountries, documentsToCollect = [], mustCollectData = [] },
}: DocDataCollectionProps) => {
  // @ts-expect-error: this will be deprecated
  const hasSelfie = mustCollectData.includes('document_and_selfie');

  return (
    <div className="flex flex-col gap-6">
      {documentTypesAndCountries && (
        <DocTypesAndCountries documentTypesAndCountries={documentTypesAndCountries} hasSelfie={hasSelfie} />
      )}
      {documentsToCollect && documentsToCollect.length > 0 && (
        <AdditionalDocs variant="sectioned" docs={documentsToCollect} />
      )}
    </div>
  );
};

export default DocDataCollection;
