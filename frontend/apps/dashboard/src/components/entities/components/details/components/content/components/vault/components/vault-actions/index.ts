import withEntity from '@/entity/components/with-entity';

import DecryptControls from './vault-actions';

export { default as useDecryptControls } from './hooks/use-decrypt-controls';

export default withEntity(DecryptControls);
