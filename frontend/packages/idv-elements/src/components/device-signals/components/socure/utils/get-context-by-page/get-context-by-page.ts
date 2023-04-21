import type { Page } from '../../../../device-signals.types';
import type { SocureContext } from '../../socure.types';

const getContextByPage = (page: Page): SocureContext => {
  if (page === 'authorize') {
    return 'transaction';
  }
  return 'profile';
};

export default getContextByPage;
