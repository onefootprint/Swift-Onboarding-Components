import BasicConfiguration from './components/basic-configuration';
import ClientCertificates from './components/client-identity';
import CustomHeaderValues from './components/custom-header-values';
import IngressVaulting from './components/ingress-vaulting';
import PinnedServerCertificates from './components/pinned-server-certificates';

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
