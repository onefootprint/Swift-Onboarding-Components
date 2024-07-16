import { createContext } from 'react';

import type { FormValues } from '../../types';

export default createContext<{
  name: keyof FormValues;
  id: string;
}>({
  name: 'id.email',
  id: 'email',
});
