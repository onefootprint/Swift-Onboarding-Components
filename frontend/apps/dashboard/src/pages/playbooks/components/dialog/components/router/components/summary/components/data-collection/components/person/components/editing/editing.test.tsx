import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import { SupportedIdDocTypes } from '@onefootprint/types';
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
    renderEditing({ kind: PlaybookKind.Kyc });
    expect(
      screen.getByText('Edit personal information & docs'),
    ).toBeInTheDocument();
  });

  it('should show correct title for KYB', async () => {
    renderEditing({ kind: PlaybookKind.Kyb });
    expect(
      screen.getByText('Edit KYC of a beneficial owner'),
    ).toBeInTheDocument();
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

      describe('when selecting DL, then un-selecting "Allow users without an SSN to proceed with the verification" and selecting it again', () => {
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
          await userEvent.click(ssnOptional);

          // select again
          await userEvent.click(ssnOptional);
          await userEvent.click(stepUp);

          expect(dl).not.toBeChecked();
        });
      });
    });
  });

  describe('when un-selecting the option to collect SSN', () => {
    it('should show the "Do document scan step-up" option', async () => {
      renderEditing({});

      const collectSsn = screen.getByRole('switch', {
        name: 'Request users to provide their SSN',
      });
      await userEvent.click(collectSsn);

      const stepUp = screen.getByLabelText('Do document scan step-up');
      expect(stepUp).toBeInTheDocument();
    });

    describe('when selecting "Do document scan step-up"', () => {
      it('should show the list of id docs', async () => {
        renderEditing({});

        const collectSsn = screen.getByRole('switch', {
          name: 'Request users to provide their SSN',
        });
        await userEvent.click(collectSsn);

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

      describe('when un-selecting "Request users to provide their SSN" and selecting it again', () => {
        it('should reset the "Do document scan step-up" option', async () => {
          renderEditing({});

          const collectSsn = screen.getByRole('switch', {
            name: 'Request users to provide their SSN',
          });
          await userEvent.click(collectSsn);

          const stepUp = screen.getByLabelText('Do document scan step-up');
          await userEvent.click(stepUp);

          // un-select
          await userEvent.click(collectSsn);

          // select again
          await userEvent.click(collectSsn);

          const stepUpAgain = screen.getByLabelText('Do document scan step-up');
          expect(stepUpAgain).not.toBeChecked();
        });
      });

      describe('when selecting DL, then un-selecting "Do document scan step-up" and selecting it again', () => {
        it('should unselect any id doc that was previously selected', async () => {
          renderEditing({});

          const collectSsn = screen.getByRole('switch', {
            name: 'Request users to provide their SSN',
          });
          await userEvent.click(collectSsn);

          const stepUp = screen.getByLabelText('Do document scan step-up');
          await userEvent.click(stepUp);

          const dl = screen.getByRole('checkbox', {
            name: "Driver's license",
          });
          await userEvent.click(dl);

          // un-select
          await userEvent.click(stepUp);

          // select again
          await userEvent.click(stepUp);

          expect(dl).not.toBeChecked();
        });
      });

      describe('when selecting DL, then un-selecting "Allow users without an SSN to proceed with the verification" and selecting it again', () => {
        it('should unselect any id doc that was previously selected', async () => {
          renderEditing({});

          const collectSsn = screen.getByRole('switch', {
            name: 'Request users to provide their SSN',
          });
          await userEvent.click(collectSsn);

          const stepUp = screen.getByLabelText('Do document scan step-up');
          await userEvent.click(stepUp);

          const dl = screen.getByRole('checkbox', {
            name: "Driver's license",
          });
          await userEvent.click(dl);

          // un-select
          await userEvent.click(collectSsn);

          // select again
          await userEvent.click(collectSsn);
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
