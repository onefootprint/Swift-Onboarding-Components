import type { IdDocOutcome } from '@onefootprint/types';
import { createContext } from 'react';

const AppContext = createContext<{
  sandboxIdDocOutcome: IdDocOutcome | null;
}>({
  sandboxIdDocOutcome: null,
});

export default AppContext;
