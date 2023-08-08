import { useContext } from 'react';

import AppContext from '../components/app-context';

const useApp = () => {
  return useContext(AppContext);
};

export default useApp;
