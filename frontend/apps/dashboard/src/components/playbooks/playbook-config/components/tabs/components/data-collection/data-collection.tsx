import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import DocDataCollection from './components/doc-data-collection';
import KycKybDataCollection from './components/kyc-kyb-data-collection/kyc-kyb-data-collection';

export type DataCollectionProps = {
  playbook: OnboardingConfiguration;
};

const DataCollection = ({ playbook }: DataCollectionProps) => {
  return playbook.kind === 'document' ? (
    <DocDataCollection playbook={playbook} />
  ) : (
    <KycKybDataCollection playbook={playbook} />
  );
};

export default DataCollection;
