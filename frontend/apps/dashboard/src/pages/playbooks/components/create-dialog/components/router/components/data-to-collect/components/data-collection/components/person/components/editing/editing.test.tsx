import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import { CollectedKybDataOption, SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';
import { asAdminUser, asAdminUserFirmEmployee, asAdminUserInOrg } from 'src/config/tests';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

import type { EditingWithContextProps } from './editing.test.config';
import EditingWithContext from './editing.test.config';

const renderEditing = ({ kind, startingValues }: EditingWithContextProps) => {
  customRender(<EditingWithContext startingValues={startingValues} kind={kind} />);
};

describe('<Editing />', () => {
  it('should show SSN options when toggling', async () => {
    renderEditing({});
    expect(screen.getByRole('radio', { name: 'Full' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Last 4' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Accept ITIN' })).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Allow users without an SSN to proceed with the verification' }),
    ).toBeInTheDocument();
    expect(screen.getByText('They will need to be manually reviewed by you.')).toBeInTheDocument();
  });

  it('should remove "Allow users without an SSN to proceed with the verification"', async () => {
    renderEditing({});

    expect(screen.queryByLabelText('Allow users without an SSN to proceed with the verification')).not.toBeNull();

    const acceptITIN = screen.getByLabelText('Accept ITIN');
    await userEvent.click(acceptITIN);

    expect(screen.queryByLabelText('Allow users without an SSN to proceed with the verification')).toBeNull();
  });

  it('should show correct title for KYC', async () => {
    renderEditing({ kind: PlaybookKind.Kyc });
    expect(screen.getByText('Edit Personal information')).toBeInTheDocument();
  });

  it('should show correct title for KYB', async () => {
    renderEditing({ kind: PlaybookKind.Kyb });
    expect(screen.getByText('Edit beneficial owners')).toBeInTheDocument();
  });

  it('should show beneficial owners collection option when KYB', () => {
    renderEditing({ kind: PlaybookKind.Kyb });
    const collectBoToogle = screen.getByRole('switch', {
      name: "Collect beneficial owners' information",
    });
    expect(collectBoToogle).toBeInTheDocument();
  });

  it('should not show beneficial owners collection option when KYC', () => {
    renderEditing({ kind: PlaybookKind.Kyc });
    const collectBoToogle = screen.queryByRole('switch', {
      name: "Collect beneficial owners' information",
    });
    expect(collectBoToogle).not.toBeInTheDocument();
  });

  it('should not show KYC options when collect BO is turned off in a KYB flow', async () => {
    renderEditing({
      kind: PlaybookKind.Kyb,
      startingValues: {
        businessInformation: {
          [CollectedKybDataOption.beneficialOwners]: true,
        },
      },
    });
    const collectBoToogle = screen.getByRole('switch', {
      name: "Collect beneficial owners' information",
    });
    expect(collectBoToogle).toBeChecked();
    await userEvent.click(collectBoToogle);
    expect(collectBoToogle).not.toBeChecked();
  });

  it('should show no phone flow option if firm employee', async () => {
    asAdminUserFirmEmployee();
    renderEditing({ kind: PlaybookKind.Kyc });
    expect(
      screen.getByRole('switch', {
        name: 'Request users to provide their phone number',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Basic information')).toBeInTheDocument();
  });

  it('should show no phone flow option if findigs employee', async () => {
    asAdminUserInOrg('Findigs.com');
    renderEditing({ kind: PlaybookKind.Kyc });

    expect(
      screen.getByRole('switch', {
        name: 'Request users to provide their phone number',
      }),
    ).toBeInTheDocument();
  });

  it('should not show no phone flow option if firm employee but KYB', async () => {
    asAdminUserFirmEmployee();
    renderEditing({ kind: PlaybookKind.Kyb });
    expect(
      screen.queryByRole('switch', {
        name: 'Request users to provide their phone number',
      }),
    ).not.toBeInTheDocument();
  });

  describe('when it is non-firm employee', () => {
    it('should hide phone option flow optione', async () => {
      asAdminUser();

      renderEditing({ kind: PlaybookKind.Kyc });

      const phoneToggle = screen.queryByRole('switch', {
        name: 'Request users to provide their phone number',
      });
      expect(phoneToggle).not.toBeInTheDocument();

      const basicInfo = screen.queryByText('Basic information');
      expect(basicInfo).not.toBeInTheDocument();
    });
  });
});
