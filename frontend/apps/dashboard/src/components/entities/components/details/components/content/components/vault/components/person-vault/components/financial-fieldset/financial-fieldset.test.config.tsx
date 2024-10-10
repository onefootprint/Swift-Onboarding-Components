import withEntity from '@/entity/components/with-entity';
import { customRender, mockRequest } from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';
import { BankDIField, DataKind, EntityKind, EntityStatus } from '@onefootprint/types';
import { FormProvider, useForm } from 'react-hook-form';
import useCurrentEntity from '../../../../../../../../hooks/use-current-entity';
import DecryptMachineProvider from '../../../../../decrypt-machine';
import FinancialFieldset from './financial-fieldset';

const entityFixture: Entity = {
  id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
  isIdentifiable: true,
  kind: EntityKind.person,
  data: [],
  attributes: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  lastActivityAt: '2023-03-27T14:43:47.444716Z',
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  status: EntityStatus.pass,
  workflows: [],
  requiresManualReview: false,
  decryptableAttributes: [],
  decryptedAttributes: {},
  label: null,
};

const defaultField = {
  source: 'source',
  isDecryptable: true,
  dataKind: DataKind.vaultData,
  transforms: {},
};

export const cardEntity: Entity = {
  ...entityFixture,
  data: [
    {
      ...defaultField,
      identifier: 'card.personal.issuer',
      value: 'Visa',
    },
    {
      ...defaultField,
      identifier: 'card.personal.number',
      value: '4111111111111111',
    },
  ],
};

export const bankAccountEntity: Entity = {
  ...entityFixture,
  data: [
    {
      ...defaultField,
      identifier: `bank.checking.${BankDIField.accountNumber}`,
      value: '1234567890',
    },
    {
      ...defaultField,
      identifier: `bank.checking.${BankDIField.routingNumber}`,
      value: '021000021',
    },
  ],
};

export const bothEntity: Entity = {
  ...entityFixture,
  data: [
    {
      ...defaultField,
      identifier: 'card.personal.issuer',
      value: 'Visa',
    },
    {
      ...defaultField,
      identifier: 'card.personal.number',
      value: '4111111111111111',
    },
    {
      ...defaultField,
      identifier: `bank.checking.${BankDIField.accountNumber}`,
      value: '1234567890',
    },
    {
      ...defaultField,
      identifier: `bank.checking.${BankDIField.routingNumber}`,
      value: '021000021',
    },
  ],
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

  mockRequest({
    path: `/entities/${mockEntity.id}/dupes`,
    method: 'get',
    response: {
      sameTenant: [],
      otherTenants: [],
    },
  });

  customRender(<WrappedFinancialFieldset />);
};
