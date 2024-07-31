import type { CountryRecord } from '@onefootprint/global-constants';
import type { SupportedIdDocTypes } from '@onefootprint/types';
import isEqual from 'lodash/isEqual';
import { useEffect, useState } from 'react';

type DocSelectorOptionType = { value: SupportedIdDocTypes; label: string };

const useSelectedDocuments = (preselectedDocs: DocSelectorOptionType[], selectedCountry: CountryRecord) => {
  const [selectedDocuments, setSelectedDocuments] = useState<DocSelectorOptionType[]>(preselectedDocs);

  useEffect(() => {
    const sortFn = (
      a: {
        value: string;
        label: string;
      },
      b: {
        value: string;
        label: string;
      },
    ) => {
      if (a.value > b.value) {
        return 1;
      }
      if (a.value < b.value) {
        return -1;
      }
      return 0;
    };
    const sortedSelectedDocuments = selectedDocuments.toSorted(sortFn);
    const sortedPreSelectedDocuments = preselectedDocs.toSorted(sortFn);
    if (!isEqual(sortedPreSelectedDocuments, sortedSelectedDocuments)) {
      setSelectedDocuments(preselectedDocs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  return { selectedDocuments, setSelectedDocuments };
};

export default useSelectedDocuments;
