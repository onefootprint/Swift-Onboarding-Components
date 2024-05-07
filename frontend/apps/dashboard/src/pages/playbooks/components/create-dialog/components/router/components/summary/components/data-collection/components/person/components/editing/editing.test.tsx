import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import {
  CollectedKybDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import React from 'react';
import {
  asAdminUser,
  asAdminUserFirmEmployee,
  asAdminUserInOrg,
} from 'src/config/tests';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

import type { EditingWithContextProps } from './editing.test.config';
import EditingWithContext from './editing.test.config';

const renderEditing = ({ kind, startingValues }: EditingWithContextProps) => {
  customRender(
    <EditingWithContext startingValues={startingValues} kind={kind} />,
  );
};

describe('<Editing />', () => {
  it('should show SSN options when toggling', async () => {
    renderEditing({});
    expect(screen.getByRole('radio', { name: 'Full' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Last 4' })).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: 'Allow users without an SSN to proceed with the verification',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('They will need to be manually reviewed by you.'),
    ).toBeInTheDocument();
  });

  it('should disable save button if ID doc not selected', async () => {
    renderEditing({
      startingValues: { personal: { idDoc: true, idDocKind: [] } },
    });
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
  });

  it('should not show warning if ID doc selected', async () => {
    renderEditing({
      startingValues: {
        personal: {
          idDoc: true,
          idDocKind: [SupportedIdDocTypes.driversLicense],
        },
      },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      screen.queryByText('You must select at least one ID document type.'),
    ).not.toBeInTheDocument();
  });

  it('save button should be disabled if ID doc not selected', async () => {
    renderEditing({
      startingValues: { personal: { idDoc: true, idDocKind: [] } },
    });
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
  });

  it('should show selfie option when just ID doc is selected', async () => {
    renderEditing({
      startingValues: { personal: { idDoc: true, idDocKind: [] } },
    });
    expect(
      screen.getByText('Request a selfie after ID upload'),
    ).toBeInTheDocument();
  });

  it('should show correct title for KYC', async () => {
    renderEditing({ kind: PlaybookKind.Kyc });
    expect(
      screen.getByText('Edit personal information & docs'),
    ).toBeInTheDocument();
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
    const idScanOption = screen.getByRole('switch', {
      name: 'Request users to scan an ID document',
    });
    expect(idScanOption).toBeInTheDocument();
    await userEvent.click(collectBoToogle);
    expect(collectBoToogle).not.toBeChecked();
    const idDocOptionRemoved = screen.queryByRole('switch', {
      name: 'Request users to scan an ID document',
    });
    expect(idDocOptionRemoved).not.toBeInTheDocument();
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

  describe('when selecting "Allow users without an SSN to proceed with the verification"', () => {
    it('should show the "Do document scan step-up" option', async () => {
      renderEditing({});

      const ssnOptional = screen.getByLabelText(
        'Allow users without an SSN to proceed with the verification',
      );
      await userEvent.click(ssnOptional);

      const stepUp = screen.getByLabelText('Do document scan step-up');
      expect(stepUp).toBeInTheDocument();
    });

    it('should disable the option to do regular id doc scan', async () => {
      renderEditing({});

      const ssnOptional = screen.getByLabelText(
        'Allow users without an SSN to proceed with the verification',
      );
      await userEvent.click(ssnOptional);

      const docStepUp = screen.getByRole('checkbox', {
        name: 'Do document scan step-up',
      });
      await userEvent.click(docStepUp);

      const idDoc = screen.getByRole('switch', {
        name: 'Request users to scan an ID document',
      });
      expect(idDoc).toBeDisabled();
    });

    describe('when selecting "Do document scan step-up"', () => {
      it('should show the list of id docs', async () => {
        renderEditing({});

        const ssnOptional = screen.getByLabelText(
          'Allow users without an SSN to proceed with the verification',
        );
        await userEvent.click(ssnOptional);

        const stepUp = screen.getByLabelText('Do document scan step-up');
        await userEvent.click(stepUp);

        const dl = screen.getByRole('checkbox', {
          name: "Driver's license",
        });
        expect(dl).toBeInTheDocument();

        const idCard = screen.getByRole('checkbox', { name: 'Identity card' });
        expect(idCard).toBeInTheDocument();

        const passport = screen.getByRole('checkbox', {
          name: 'Passport (photo page)',
        });
        expect(passport).toBeInTheDocument();

        const visa = screen.getByRole('checkbox', { name: 'Visa' });
        expect(visa).toBeInTheDocument();

        const residenceCard = screen.getByRole('checkbox', {
          name: 'Residence card',
        });
        expect(residenceCard).toBeInTheDocument();

        const workPermit = screen.getByRole('checkbox', {
          name: 'Work permit',
        });
        expect(workPermit).toBeInTheDocument();
      });

      describe('when un-selecting "Allow users without an SSN to proceed with the verification" and selecting it again', () => {
        it('should reset the "Do document scan step-up" option', async () => {
          renderEditing({});

          const ssnOptional = screen.getByLabelText(
            'Allow users without an SSN to proceed with the verification',
          );
          await userEvent.click(ssnOptional);

          const stepUp = screen.getByLabelText('Do document scan step-up');
          await userEvent.click(stepUp);

          // un-select
          await userEvent.click(ssnOptional);

          // select again
          await userEvent.click(ssnOptional);

          const stepUpAgain = screen.getByLabelText('Do document scan step-up');
          expect(stepUpAgain).not.toBeChecked();
        });
      });

      describe('when selecting DL, then un-selecting "Do document scan step-up" and selecting it again', () => {
        it('should unselect any id doc that was previously selected', async () => {
          renderEditing({});

          const ssnOptional = screen.getByLabelText(
            'Allow users without an SSN to proceed with the verification',
          );
          await userEvent.click(ssnOptional);

          const stepUp = screen.getByLabelText('Do document scan step-up');
          await userEvent.click(stepUp);

          const dl = screen.getByRole('checkbox', {
            name: "Driver's license",
          });
          await userEvent.click(dl);
          expect(dl).toBeChecked();

          // un-select
          await userEvent.click(stepUp);

          // select again
          await userEvent.click(stepUp);

          expect(dl).not.toBeChecked();
        });
      });
    });
  });

  describe('when selecting the option to collect id doc', () => {
    it('should show the list of id docs', async () => {
      renderEditing({});

      const requestIdDoc = screen.getByRole('switch', {
        name: 'Request users to scan an ID document',
      });
      await userEvent.click(requestIdDoc);

      const dl = screen.getByRole('checkbox', {
        name: "Driver's license",
      });
      expect(dl).toBeInTheDocument();

      const idCard = screen.getByRole('checkbox', { name: 'Identity card' });
      expect(idCard).toBeInTheDocument();

      const passport = screen.getByRole('checkbox', {
        name: 'Passport (photo page)',
      });
      expect(passport).toBeInTheDocument();

      const visa = screen.getByRole('checkbox', { name: 'Visa' });
      expect(visa).toBeInTheDocument();

      const residenceCard = screen.getByRole('checkbox', {
        name: 'Residence card',
      });
      expect(residenceCard).toBeInTheDocument();

      const workPermit = screen.getByRole('checkbox', {
        name: 'Work permit',
      });
      expect(workPermit).toBeInTheDocument();
    });

    it('should disable the option to "Do document scan step-up"', async () => {
      renderEditing({});

      const optionalSsn = screen.getByRole('checkbox', {
        name: 'Allow users without an SSN to proceed with the verification',
      });
      await userEvent.click(optionalSsn);

      const collectIdDoc = screen.getByRole('switch', {
        name: 'Request users to scan an ID document',
      });
      await userEvent.click(collectIdDoc);

      const docStepUp = screen.getByRole('checkbox', {
        name: 'Do document scan step-up',
      });
      expect(docStepUp).toBeDisabled();
    });

    describe('when selecting DL, then un-selecting the option to collect id doc and selecting it again', () => {
      it('should unselect any id doc that was previously selected', async () => {
        renderEditing({});

        const requestIdDoc = screen.getByRole('switch', {
          name: 'Request users to scan an ID document',
        });
        await userEvent.click(requestIdDoc);

        const dl = screen.getByRole('checkbox', {
          name: "Driver's license",
        });
        await userEvent.click(dl);
        expect(dl).toBeChecked();

        // un-select
        await userEvent.click(requestIdDoc);

        // select again
        await userEvent.click(requestIdDoc);

        expect(dl).not.toBeChecked();
      });
    });
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
