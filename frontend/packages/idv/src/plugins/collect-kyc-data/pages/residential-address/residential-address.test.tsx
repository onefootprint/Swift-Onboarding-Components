import {
  createGoogleMapsSpy,
  customRender,
  getPlacePredictions,
  screen,
  selectEvents,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { IdDI } from '@onefootprint/types';
import React from 'react';

import type { KycData } from '../../utils/data-types';
import type { InitMachineArgs } from '../../utils/state-machine/machine';
import TestWrapper from '../../utils/test-wrapper';
import ResidentialAddress from './residential-address';
import getInitialContext, { withUserVault } from './residential-address.test.config';

const renderResidentialAddress = (initialContext: InitMachineArgs, onComplete?: (args: KycData) => void) =>
  customRender(
    <TestWrapper initialContext={initialContext} initState="residentialAddress">
      <ResidentialAddress onComplete={onComplete} />
    </TestWrapper>,
  );

describe('<ResidentialAddress />', () => {
  beforeEach(() => {
    createGoogleMapsSpy();
    getPlacePredictions.mockClear();
    withUserVault();
  });
  const otherValues = {
    disabled: false,
    decrypted: false,
    scrubbed: false,
    bootstrap: false,
    dirty: false,
  };

  describe('When in US only flow', () => {
    describe('when address is not a PO box', () => {
      it.each`
        address
        ${'2343 Adams Street'}
        ${'Main Street 343'}
      `(`for $address should not show error`, async ({ address }) => {
        const initialContext = getInitialContext({
          data: {
            [IdDI.addressLine1]: {
              value: address,
              ...otherValues,
            },
          },
        });

        renderResidentialAddress(initialContext);
        const continueButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(continueButton);

        await waitFor(() => {
          expect(
            screen.queryByText('Address cannot be empty and must be a residential address (e.g. cannot be a P.O. Box)'),
          ).toBeNull();
        });
      });
    });

    describe('when address is a PO box', () => {
      it.each`
        poBoxAddress
        ${'PO123'}
        ${'PO 223'}
        ${'PO. 23423'}
        ${'P.O. 3432'}
        ${'P.O.3432'}
        ${'PO Box 123'}
        ${'P.O. box 232'}
        ${'p.o. BOX 2323'}
        ${'pobox 234'}
        ${'pobox12321'}
      `(`for $poBoxAddress should show error`, async ({ poBoxAddress }) => {
        const initialContext = getInitialContext({
          data: {
            [IdDI.addressLine1]: {
              value: poBoxAddress,
              ...otherValues,
            },
          },
        });

        renderResidentialAddress(initialContext);
        const continueButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(continueButton);

        await waitFor(() => {
          expect(
            screen.getByText('Address cannot be empty and must be a residential address (e.g. cannot be a P.O. Box)'),
          ).toBeInTheDocument();
        });
      });
    });

    it('should show disabled country picker with US as default value', () => {
      const initialContext = getInitialContext();
      renderResidentialAddress(initialContext);

      const countryPicker = screen.getByRole('button', {
        name: 'United States of America',
      }) as HTMLButtonElement;
      expect(countryPicker).toBeDisabled();
    });

    it('shows state field', async () => {
      const initialContext = getInitialContext({
        allowInternationalResidents: false,
        supportedCountries: ['US'],
      });
      renderResidentialAddress(initialContext);
      expect(screen.getByRole('button', { name: 'State' })).toBeInTheDocument();
    });

    it('should show errors when there are missing fields', async () => {
      const initialContext = getInitialContext();
      renderResidentialAddress(initialContext);

      await waitFor(() => {
        expect(screen.getByText('Only addresses in United States of America are accepted')).toBeInTheDocument();
      });

      const continueButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(continueButton);

      await waitFor(() => {
        expect(
          screen.getByText('Address cannot be empty and must be a residential address (e.g. cannot be a P.O. Box)'),
        ).toBeInTheDocument();
      });

      expect(screen.getByText('City cannot be empty')).toBeInTheDocument();
      expect(screen.getByText('State cannot be empty')).toBeInTheDocument();
      expect(screen.getByText('Zip code cannot be empty or is invalid')).toBeInTheDocument();
    });

    it('should allow bootstrapping data', async () => {
      const onComplete = jest.fn();
      const initialContext = getInitialContext({
        data: {
          [IdDI.addressLine1]: {
            value: '345 Harrison Ave',
            ...otherValues,
          },
          [IdDI.addressLine2]: {
            value: 'My neighborhood',
            ...otherValues,
          },
          [IdDI.city]: {
            value: 'Boston',
            ...otherValues,
          },
          [IdDI.state]: {
            value: 'MA',
            ...otherValues,
          },
          [IdDI.zip]: {
            value: '12345',
            ...otherValues,
          },
          [IdDI.country]: {
            value: 'US',
            ...otherValues,
          },
        },
        allowInternationalResidents: false,
        supportedCountries: ['US'],
      });
      renderResidentialAddress(initialContext, onComplete);

      const continueButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(continueButton);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith({
          [IdDI.addressLine1]: {
            value: '345 Harrison Ave',
            ...otherValues,
          },
          [IdDI.addressLine2]: {
            value: 'My neighborhood',
            ...otherValues,
          },
          [IdDI.city]: {
            value: 'Boston',
            ...otherValues,
          },
          [IdDI.state]: {
            value: 'MA',
            ...otherValues,
          },
          [IdDI.zip]: {
            value: '12345',
            ...otherValues,
          },
          [IdDI.country]: {
            value: 'US',
            ...otherValues,
          },
        });
      });
    });
  });

  describe('When in international flow', () => {
    describe('When there is only one country supported', () => {
      it('should allow changing selected country', async () => {
        const onComplete = jest.fn();
        const initialContext = getInitialContext({
          data: {
            [IdDI.addressLine1]: {
              value: '19 de Septiembre 79',
              ...otherValues,
            },
            [IdDI.addressLine2]: {
              value: 'My neighborhood',
              ...otherValues,
            },
            [IdDI.city]: {
              value: 'Ciudad de Mexico',
              ...otherValues,
            },
            [IdDI.state]: {
              value: 'Baja California',
              ...otherValues,
            },
            [IdDI.zip]: {
              value: '12345',
              ...otherValues,
            },
          },
          allowInternationalResidents: true,
          supportedCountries: ['US', 'MX'],
        });
        renderResidentialAddress(initialContext, onComplete);

        const trigger = screen.getByRole('button', {
          name: 'United States of America',
        });
        await selectEvents.select(trigger, 'Mexico');

        const continueButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(continueButton);

        await waitFor(() => {
          expect(
            screen.getByRole('button', {
              name: 'Mexico',
            }),
          ).toBeInTheDocument();
        });
      });

      it('should allow bootstrapping data', async () => {
        const onComplete = jest.fn();
        const initialContext = getInitialContext({
          data: {
            [IdDI.addressLine1]: {
              value: '19 de Septiembre 79',
              ...otherValues,
            },
            [IdDI.addressLine2]: {
              value: 'My neighborhood',
              ...otherValues,
            },
            [IdDI.city]: {
              value: 'Ciudad de Mexico',
              ...otherValues,
            },
            [IdDI.state]: {
              value: 'Ciudad de Mexico',
              ...otherValues,
            },
            [IdDI.zip]: {
              value: '12345',
              ...otherValues,
            },
            [IdDI.country]: {
              value: 'MX',
              ...otherValues,
            },
          },
          allowInternationalResidents: true,
          supportedCountries: ['MX'],
        });
        renderResidentialAddress(initialContext, onComplete);

        const continueButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(continueButton);

        await waitFor(() => {
          expect(onComplete).toHaveBeenCalledWith({
            [IdDI.addressLine1]: {
              value: '19 de Septiembre 79',
              ...otherValues,
            },
            [IdDI.addressLine2]: {
              value: 'My neighborhood',
              ...otherValues,
            },
            [IdDI.city]: {
              value: 'Ciudad de Mexico',
              ...otherValues,
            },
            [IdDI.state]: {
              value: 'Ciudad de Mexico',
              ...otherValues,
            },
            [IdDI.zip]: {
              value: '12345',
              ...otherValues,
            },
            [IdDI.country]: {
              value: 'MX',
              ...otherValues,
            },
          });
        });
      });
    });

    describe('When there are multiple countries supported', () => {
      it('should show disabled country picker with foreign country as default value', () => {
        const initialContext = getInitialContext({
          allowInternationalResidents: true,
          supportedCountries: ['MX'],
        });
        renderResidentialAddress(initialContext);

        const countryPicker = screen.getByRole('button', {
          name: 'Mexico',
        }) as HTMLButtonElement;
        expect(countryPicker).toBeDisabled();
        expect(screen.getByText('Mexico')).toBeInTheDocument();
      });

      it('should show errors when there are missing fields', async () => {
        const initialContext = getInitialContext({
          allowInternationalResidents: true,
          supportedCountries: ['MX'],
        });
        renderResidentialAddress(initialContext);

        await waitFor(() => {
          expect(screen.getByText('Only addresses in Mexico are accepted')).toBeInTheDocument();
        });

        const continueButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(continueButton);

        await waitFor(() => {
          expect(
            screen.getByText('Address cannot be empty and must be a residential address (e.g. cannot be a P.O. Box)'),
          ).toBeInTheDocument();
        });
        expect(screen.getByText('City cannot be empty')).toBeInTheDocument();
      });

      it('shows state field if country has state', async () => {
        const initialContext = getInitialContext({
          allowInternationalResidents: true,
          supportedCountries: ['MX'],
        });
        renderResidentialAddress(initialContext);
        expect(screen.getByRole('textbox', { name: 'State/province' })).toBeInTheDocument();
      });

      it('hides state field if country does not have states', async () => {
        const initialContext = getInitialContext({
          allowInternationalResidents: true,
          supportedCountries: ['YE'],
        });
        renderResidentialAddress(initialContext);
        expect(screen.queryByRole('button', { name: 'State' })).toBeNull();
        expect(screen.queryByRole('textbox', { name: 'State/province' })).toBeNull();
      });
    });
  });
});
