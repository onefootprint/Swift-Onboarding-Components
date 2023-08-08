import { IdDocOutcomes } from '@onefootprint/types';
import { createContext } from 'react';

const AppContext = createContext<{
  sandboxIdDocOutcome: IdDocOutcomes | null;
}>({
  sandboxIdDocOutcome: null,
});

export default AppContext;
