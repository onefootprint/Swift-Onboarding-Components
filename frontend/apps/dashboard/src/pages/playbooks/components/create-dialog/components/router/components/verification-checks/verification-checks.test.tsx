import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import VerificationChecks from '.';
import type { VerificationChecksProps } from './verification-checks';

describe('VerificationChecks', () => {
  const renderAml = ({
    defaultAmlValues = {
      enhancedAml: false,
      ofac: false,
      pep: false,
      adverseMedia: false,
    },
    isLoading = false,
    onBack = jest.fn(),
    onSubmit = jest.fn(),
    requiresDoc = false,
    allowInternationalResident = false,
  }: Partial<VerificationChecksProps>) => {
    customRender(
      <VerificationChecks
        defaultAmlValues={defaultAmlValues}
        isLoading={isLoading}
        onBack={onBack}
        onSubmit={onSubmit}
        requiresDoc={requiresDoc}
        allowInternationalResident={allowInternationalResident}
      />,
    );
  };

  describe('initial state', () => {
    it('should only show the "AML monitoring" option', () => {
      renderAml({});

      const kycCheck = screen.queryAllByRole('switch', {
        name: 'Perform database checks with collected identity data',
      });
      expect(kycCheck).toHaveLength(0);

      const aml = screen.getByRole('switch', {
        name: 'Enhanced AML monitoring',
      });
      expect(aml).toBeInTheDocument();

      const ofac = screen.queryByRole('checkbox', {
        name: 'Office of Foreign Assets Control (OFAC)',
      });
      expect(ofac).not.toBeInTheDocument();

      const pep = screen.queryByRole('checkbox', {
        name: 'Politically Exposed Person (PEP)',
      });
      expect(pep).not.toBeInTheDocument();

      const adverseMedia = screen.queryByRole('checkbox', {
        name: 'Adverse media',
      });
      expect(adverseMedia).not.toBeInTheDocument();
    });
  });

  describe('kyc check', () => {
    it('should show the "KYC check" option', () => {
      renderAml({ requiresDoc: true });

      const kycCheck = screen.getByRole('switch', {
        name: 'Perform database checks with collected identity data',
      });
      expect(kycCheck).toBeInTheDocument();
    });
  });

  describe('when selecting "AML monitoring"', () => {
    it('should show the "AML monitoring" option', async () => {
      renderAml({});

      const aml = screen.getByRole('switch', {
        name: 'Enhanced AML monitoring',
      });
      await userEvent.click(aml);

      const ofac = screen.getByRole('checkbox', {
        name: 'Office of Foreign Assets Control (OFAC)',
      });
      expect(ofac).toBeInTheDocument();

      const pep = screen.getByRole('checkbox', {
        name: 'Politically Exposed Person (PEP)',
      });
      expect(pep).toBeInTheDocument();

      const adverseMedia = screen.getByRole('checkbox', {
        name: 'Adverse media',
      });
      expect(adverseMedia).toBeInTheDocument();
    });
  });

  describe('when submitting the data', () => {
    it('should call the onSubmit callback', async () => {
      const onSubmit = jest.fn();
      renderAml({ onSubmit, allowInternationalResident: true });

      const kycCheck = screen.getByRole('switch', {
        name: 'Perform database checks with collected identity data',
      });
      await userEvent.click(kycCheck);

      const aml = screen.getByRole('switch', {
        name: 'Enhanced AML monitoring',
      });
      await userEvent.click(aml);

      const ofac = screen.getByRole('checkbox', {
        name: 'Office of Foreign Assets Control (OFAC)',
      });
      await userEvent.click(ofac);

      const pep = screen.getByRole('checkbox', {
        name: 'Politically Exposed Person (PEP)',
      });
      await userEvent.click(pep);

      const adverseMedia = screen.getByRole('checkbox', {
        name: 'Adverse media',
      });
      await userEvent.click(adverseMedia);

      const submit = screen.getByRole('button', { name: 'Create Playbook' });
      await userEvent.click(submit);

      expect(onSubmit).toHaveBeenCalledWith({
        skipKyc: true,
        amlFormData: {
          enhancedAml: true,
          ofac: true,
          pep: true,
          adverseMedia: true,
        },
      });
    });
  });

  describe('when it is loading', () => {
    it('should show the loading state', () => {
      renderAml({ isLoading: true });

      const back = screen.getByRole('button', { name: 'Back' });
      expect(back).toBeDisabled();

      const submit = screen.getByRole('progressbar', { name: 'Loading...' });
      expect(submit).toBeInTheDocument();
    });
  });

  describe('when clicking on the back button', () => {
    it('should call the onBack callback', async () => {
      const onBack = jest.fn();
      renderAml({ onBack });

      const back = screen.getByRole('button', { name: 'Back' });
      await userEvent.click(back);

      expect(onBack).toHaveBeenCalled();
    });
  });

  describe('when it has default data', () => {
    it('should render the default data', () => {
      renderAml({
        defaultAmlValues: {
          enhancedAml: true,
          ofac: true,
          pep: true,
          adverseMedia: true,
        },
      });

      const aml = screen.getByRole('switch', {
        name: 'Enhanced AML monitoring',
      });
      expect(aml).toBeChecked();

      const ofac = screen.getByRole('checkbox', {
        name: 'Office of Foreign Assets Control (OFAC)',
      });
      expect(ofac).toBeChecked();

      const pep = screen.getByRole('checkbox', {
        name: 'Politically Exposed Person (PEP)',
      });
      expect(pep).toBeChecked();

      const adverseMedia = screen.getByRole('checkbox', {
        name: 'Adverse media',
      });
      expect(adverseMedia).toBeChecked();
    });
  });
});
