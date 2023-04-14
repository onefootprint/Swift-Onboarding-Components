import constate from 'constate';

import { IdvCallbacks, IdvLayout } from '../../idv.types';

type AppContextArgs = {
  layout: IdvLayout;
  callbacks: IdvCallbacks;
};

const useLocalAppContext = (args: AppContextArgs) => args;

const [AppContextProvider, useAppContext] = constate(useLocalAppContext);

export default AppContextProvider;
export { useAppContext };
