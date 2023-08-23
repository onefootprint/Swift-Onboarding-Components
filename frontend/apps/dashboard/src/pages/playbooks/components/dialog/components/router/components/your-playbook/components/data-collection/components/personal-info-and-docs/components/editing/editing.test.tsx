import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import { SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';
import { asAdminUser, asAdminUserFirmEmployee } from 'src/config/tests';

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
    expect(screen.getByRole('radio', { name: 'Full' })).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: 'Last 4 digits' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'Allow users without an SSN to proceed with the verification',
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
    expect(
      screen.getByRole('checkbox', {
        name: 'Visa',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'Residence card',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'Work permit',
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

  it('should not show selfie option when just ID doc is open', async () => {
    renderEditing({ startingValues: { idDoc: true, idDocKind: [] } });
    expect(screen.queryByText('Request a selfie')).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'You can optionally request users to take a selfie to validate the ID document requested.',
      ),
    ).not.toBeInTheDocument();

    const idCard = screen.getByRole('checkbox', { name: 'Identity card' });
    await userEvent.click(idCard);
    expect(screen.getByText('Request a selfie')).toBeInTheDocument();
    expect(
      screen.getByText(
        'You can optionally request users to take a selfie to validate the ID document requested.',
      ),
    ).toBeInTheDocument();
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

  it('should show no phone flow option if firm employee', async () => {
    asAdminUserFirmEmployee();
    renderEditing({ kind: Kind.KYC });
    expect(
      screen.getByRole('switch', {
        name: 'Request users to provide their phone number',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Basic information')).toBeInTheDocument();
  });

  it('should hide phone option flow option if non-firm employee', async () => {
    asAdminUser();
    renderEditing({ kind: Kind.KYC });
    expect(
      screen.queryByRole('switch', {
        name: 'Request users to provide their phone number',
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Basic information')).not.toBeInTheDocument();
  });
});
