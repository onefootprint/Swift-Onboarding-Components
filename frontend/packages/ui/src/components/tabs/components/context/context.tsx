import { createContext } from 'react';

const TabContext = createContext<{
  variant: 'pill' | 'underlined';
  layoutId: string;
}>({
  variant: 'underlined',
  layoutId: '',
});

export default TabContext;
