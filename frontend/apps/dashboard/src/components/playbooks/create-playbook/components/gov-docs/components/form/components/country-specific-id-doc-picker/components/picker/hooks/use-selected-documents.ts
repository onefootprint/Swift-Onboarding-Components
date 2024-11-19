import type { CountryRecord } from '@onefootprint/global-constants';
import type { IdDocKind } from '@onefootprint/request-types/dashboard';
import isEqual from 'lodash/isEqual';
import { useEffect, useState } from 'react';

type DocSelectorOptionType = { value: IdDocKind; label: string };

const useSelectedDocuments = (preselectedDocs: DocSelectorOptionType[], selectedCountry: CountryRecord) => {
  const [selectedDocuments, setSelectedDocuments] = useState<DocSelectorOptionType[]>(preselectedDocs);

  useEffect(() => {
    const sortedSelectedDocuments = [...selectedDocuments].sort((a, b) => a.value.localeCompare(b.value));
    const sortedPreSelectedDocuments = [...preselectedDocs].sort((a, b) => a.value.localeCompare(b.value));
    if (!isEqual(sortedPreSelectedDocuments, sortedSelectedDocuments)) {
      setSelectedDocuments(preselectedDocs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  return { selectedDocuments, setSelectedDocuments };
};

export default useSelectedDocuments;
