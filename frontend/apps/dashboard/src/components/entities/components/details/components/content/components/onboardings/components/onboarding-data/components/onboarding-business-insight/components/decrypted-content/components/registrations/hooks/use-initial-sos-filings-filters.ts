import { useMemo } from 'react';

import type { FormData } from '../components/drawer-filter';
import useSOSFilingsFilters from './use-sos-filings-filters';

const useInitialSOSFilingsFilters = () => {
  const { values } = useSOSFilingsFilters();

  const emptyValues: FormData = {
    states: [],
  };

  const defaultValues = useMemo(() => {
    const defaultData: FormData = {
      states: [],
    };
    if (values.states) {
      defaultData.states = values.states;
    }
    return defaultData;
  }, [values]);

  return { emptyValues, defaultValues };
};

export default useInitialSOSFilingsFilters;
