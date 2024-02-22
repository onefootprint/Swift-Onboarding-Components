'use client';

import { createContext } from 'react';

const TabContext = createContext<{
  layoutId: string;
}>({
  layoutId: '',
});

export default TabContext;
