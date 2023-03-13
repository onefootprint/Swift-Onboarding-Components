import BasicConfiguration from '../../../form/basic-configuration';
import ClientCertificates from '../../../form/client-identity';
import CustomHeaderValues from '../../../form/custom-header-values';
import IngressVaulting from '../../../form/ingress-vaulting';
import PinnedServerCertificates from '../../../form/pinned-server-certificates';

const steps = [
  { id: 'base-config', Component: BasicConfiguration, canSkip: false },
  { id: 'custom-header', Component: CustomHeaderValues, canSkip: true },
  { id: 'client-identity', Component: ClientCertificates, canSkip: true },
  {
    id: 'server-certificates',
    Component: PinnedServerCertificates,
    canSkip: true,
  },
  { id: 'ingress-vaulting', Component: IngressVaulting, canSkip: false },
];

export default steps;
