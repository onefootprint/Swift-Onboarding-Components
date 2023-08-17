import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import { Kind } from '../../../../../../your-playbook.types';
import EditingWithContext, {
  EditingWithContextProps,
} from './editing.test.config';

const renderEditing = ({ kind }: EditingWithContextProps) => {
  customRender(<EditingWithContext kind={kind} />);
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
