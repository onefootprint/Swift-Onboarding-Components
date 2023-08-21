import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import { SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';

import { Kind } from '@/playbooks/utils/machine/types';

import EditingWithContext, {
  EditingWithContextProps,
} from './editing.test.config';

const renderEditing = ({ kind, startingValues }: EditingWithContextProps) => {
  customRender(
    <EditingWithContext startingValues={startingValues} kind={kind} />,
  );
};

describe('<Editing />', () => {
  it('should show SSN options when toggling', async () => {
    renderEditing({});
    const ssnToggle = screen.getByRole('switch', {
      name: 'Request users to provide their SSN',
    });
    await userEvent.click(ssnToggle);
    expect(screen.getByRole('radio', { name: 'Full' })).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Last 4 digits' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'Allow users without a Social Security Number to proceed with the verification',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('They will need to be manually reviewed by you.'),
    ).toBeInTheDocument();
  });

  it('should show ID doc options when toggling', async () => {
    renderEditing({});
    const ssnToggle = screen.getByRole('switch', {
      name: 'Request users to scan an ID document',
    });
    await userEvent.click(ssnToggle);
    expect(
      screen.getByRole('checkbox', {
        name: "Driver's license",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'Identity card',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'Passport (photo page)',
      }),
    ).toBeInTheDocument();
  });

  it('should show warning if ID doc not selected', async () => {
    renderEditing({ startingValues: { idDoc: true, idDocKind: [] } });
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      screen.getByText('You must select at least one ID document type.'),
    ).toBeInTheDocument();
  });

  it('should not show warning if ID doc selected', async () => {
    renderEditing({
      startingValues: {
        idDoc: true,
        idDocKind: [SupportedIdDocTypes.driversLicense],
      },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      screen.queryByText('You must select at least one ID document type.'),
    ).not.toBeInTheDocument();
  });

  it('should show warning if ID doc not selected and hide once any selected', async () => {
    renderEditing({ startingValues: { idDoc: true, idDocKind: [] } });
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      screen.getByText('You must select at least one ID document type.'),
    ).toBeInTheDocument();
    const idCard = screen.getByRole('checkbox', { name: 'Identity card' });
    await userEvent.click(idCard);
    expect(
      screen.queryByText('You must select at least one ID document type.'),
    ).not.toBeInTheDocument();
  });

  it('should show correct title for KYC', async () => {
    renderEditing({ kind: Kind.KYC });
    expect(
      screen.getByText('Edit personal information & docs'),
    ).toBeInTheDocument();
  });

  it('should show correct title for KYB', async () => {
    renderEditing({ kind: Kind.KYB });
    expect(
      screen.getByText('Edit KYC of a beneficial owner'),
    ).toBeInTheDocument();
  });
});
