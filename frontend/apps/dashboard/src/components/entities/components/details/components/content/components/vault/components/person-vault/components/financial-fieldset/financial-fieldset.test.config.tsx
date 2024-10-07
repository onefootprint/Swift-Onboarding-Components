import withEntity from '@/entity/components/with-entity';
import { customRender } from '@onefootprint/test-utils';
import type {
  DataIdentifier,
  Entity,
  EntityKind,
  EntityLabel,
  EntityStatus,
  WatchlistCheckStatus,
} from '@onefootprint/types';
import { FormProvider, useForm } from 'react-hook-form';
import useCurrentEntity from '../../../../../../../../hooks/use-current-entity';
import DecryptMachineProvider from '../../../../../decrypt-machine';
import FinancialFieldset from './financial-fieldset';

export const entityFixture: Entity = {
  id: '123',
  data: [],
  attributes: [] as DataIdentifier[],
  hasOutstandingWorkflowRequest: false,
  isIdentifiable: true,
  kind: 'person' as EntityKind,
  label: 'Test Person' as EntityLabel,
  lastActivityAt: new Date().toISOString(),
  requiresManualReview: false,
  startTimestamp: new Date().toISOString(),
  status: 'active' as EntityStatus,
  watchlistCheck: { status: 'clear' as WatchlistCheckStatus, id: '123', reasonCodes: [] },
  workflows: [],
  decryptableAttributes: [],
  decryptedAttributes: {},
};

export const cardEntity: Entity = {
  ...entityFixture,
  attributes: ['card.personal.issuer', 'card.personal.number'] as DataIdentifier[],
};

export const bankAccountEntity: Entity = {
  ...entityFixture,
  attributes: ['bank.checking.ach_account_number', 'bank.checking.ach_routing_number'] as DataIdentifier[],
};

export const bothEntity: Entity = {
  ...entityFixture,
  attributes: [...cardEntity.attributes, ...bankAccountEntity.attributes] as DataIdentifier[],
};

const mockIconComponent = () => <div aria-label="test icon" />;

jest.mock('../../../../../../../../hooks/use-current-entity');

const InternalFinancialFieldset: React.FC<{ entity: Entity }> = ({ entity }) => {
  const methods = useForm();
  return (
    <DecryptMachineProvider>
      <FormProvider {...methods}>
        <FinancialFieldset title="Financial Information" iconComponent={mockIconComponent} entity={entity} />
      </FormProvider>
    </DecryptMachineProvider>
  );
};

export const renderFinancialFieldset = ({ entity }: { entity?: Entity } = {}) => {
  const mockEntity = entity || bothEntity;
  (useCurrentEntity as jest.Mock).mockReturnValue({ data: mockEntity });
  const WrappedFinancialFieldset = withEntity(InternalFinancialFieldset);
  customRender(<WrappedFinancialFieldset />);
};
