import { customRender, screen } from '@onefootprint/test-utils';
import type { DuplicateDataItem } from '@onefootprint/types';
import { DataKind, DupeKind, EntityStatus, IdDI } from '@onefootprint/types';

import type { RowProps } from './row';
import Row from './row';

const renderRow = ({ duplicateDataItem }: RowProps) =>
  customRender(
    <table>
      <tbody>
        <tr>
          <Row duplicateDataItem={duplicateDataItem} />
        </tr>
      </tbody>
    </table>,
  );

describe('Duplicate data table row <Row />', () => {
  it('should show the same tenant data', () => {
    const data: DuplicateDataItem = {
      dupeKinds: [DupeKind.phoneNumber, DupeKind.email, DupeKind.ssn9],
      fpId: 'fp_id_test',
      status: EntityStatus.pass,
      startTimestamp: '2023-10-30T16:38:20.506011Z',
      data: [
        {
          identifier: IdDI.lastName,
          source: 'hosted',
          isDecryptable: true,
          dataKind: DataKind.vaultData,
          value: null,
          transforms: {
            prefix_1: 'D',
          },
        },
        {
          identifier: IdDI.city,
          source: 'hosted',
          isDecryptable: true,
          dataKind: DataKind.vaultData,
          value: null,
          transforms: {},
        },
        {
          identifier: IdDI.firstName,
          source: 'hosted',
          isDecryptable: true,
          dataKind: DataKind.vaultData,
          value: 'Jane',
          transforms: {},
        },
      ],
    };
    renderRow({ duplicateDataItem: data });
    expect(screen.getByText('Jane D.')).toBeInTheDocument();
    expect(screen.getByText('fp_id_test')).toBeInTheDocument();
    expect(screen.getByText('Phone number')).toBeInTheDocument();
    expect(screen.getByText('Email address')).toBeInTheDocument();
    expect(screen.getByText('SSN')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText('10/30/23, 4:38 PM')).toBeInTheDocument();
  });
});
