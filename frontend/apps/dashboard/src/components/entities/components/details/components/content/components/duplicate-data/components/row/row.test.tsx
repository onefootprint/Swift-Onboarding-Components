import { customRender, screen } from '@onefootprint/test-utils';
import { DataKind, DupeKind, EntityStatus, IdDI } from '@onefootprint/types';
import React from 'react';

import type {
  OtherTenantsDuplicateDataSummaryRow,
  RowProps,
  SameTenantDuplicateDataItemRow,
} from './row';
import Row from './row';

const renderRow = ({ duplicateDataTableRowItem }: RowProps) =>
  customRender(
    <table>
      <tbody>
        <tr>
          <Row duplicateDataTableRowItem={duplicateDataTableRowItem} />
        </tr>
      </tbody>
    </table>,
  );

describe('Duplicate data table row <Row />', () => {
  it('should show the same tenant data', () => {
    const sameTenant: SameTenantDuplicateDataItemRow = {
      sameTenant: {
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
      },
    };
    renderRow({ duplicateDataTableRowItem: sameTenant });
    expect(screen.getByText('Jane D.')).toBeInTheDocument();
    expect(screen.getByText('fp_id_test')).toBeInTheDocument();
    expect(screen.getByText('Phone number')).toBeInTheDocument();
    expect(screen.getByText('Email address')).toBeInTheDocument();
    expect(screen.getByText('SSN')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('10/30/23, 4:38 PM')).toBeInTheDocument();
  });

  it('should show the other tenant data', () => {
    const otherTenant: OtherTenantsDuplicateDataSummaryRow = {
      otherTenant: {
        data: {
          numMatches: 3,
          numTenants: 2,
        },
        isSameTenantEmpty: false,
      },
    };
    renderRow({ duplicateDataTableRowItem: otherTenant });
    expect(screen.getByTestId('other-tenant-summary')).toHaveTextContent(
      'Plus 3 more matches in 2 other companies',
    );
  });

  it('should show the empty same tenant data', () => {
    const sameTenant: SameTenantDuplicateDataItemRow = {
      sameTenant: undefined,
    };
    renderRow({ duplicateDataTableRowItem: sameTenant });
    expect(screen.getByText('No matches in')).toBeInTheDocument();
  });

  it('other tenant data when same tenant is empty', () => {
    const otherTenant: OtherTenantsDuplicateDataSummaryRow = {
      otherTenant: {
        data: {
          numMatches: 3,
          numTenants: 2,
        },
        isSameTenantEmpty: true,
      },
    };
    renderRow({ duplicateDataTableRowItem: otherTenant });
    expect(screen.getByTestId('other-tenant-summary')).toHaveTextContent(
      '3 matches in 2 other companies',
    );
  });
});
