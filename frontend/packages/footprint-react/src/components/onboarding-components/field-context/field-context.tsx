import { createContext } from 'react';

import type { Di } from '../../../@types';

export default createContext<{
  name: keyof Di;
  id: string;
}>({
  name: 'id.email',
  id: 'email',
});
