import { type OnboardingConfig, OnboardingConfigKind } from '@onefootprint/types';
import DocDataCollection from './components/doc-data-collection';
import KycKybDataCollection from './components/kyc-kyb-data-collection/kyc-kyb-data-collection';

export type DataCollectionProps = {
  playbook: OnboardingConfig;
};

const DataCollection = ({ playbook }: DataCollectionProps) =>
  playbook.kind === OnboardingConfigKind.document ? (
    <DocDataCollection playbook={playbook} />
  ) : (
    <KycKybDataCollection playbook={playbook} />
  );

export default DataCollection;
