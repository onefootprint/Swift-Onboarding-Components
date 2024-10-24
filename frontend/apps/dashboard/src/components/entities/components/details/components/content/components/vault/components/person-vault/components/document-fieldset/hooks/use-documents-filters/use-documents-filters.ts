import useFilters from 'src/hooks/use-filters';

export type DocumentDetailsQueryParams = {
  document_id?: string;
};

const defaultQueryParams: DocumentDetailsQueryParams = {
  document_id: undefined,
};

const useDocumentsFilters = () => {
  const filters = useFilters<DocumentDetailsQueryParams>(defaultQueryParams);
  return {
    ...filters,
  };
};

export default useDocumentsFilters;
