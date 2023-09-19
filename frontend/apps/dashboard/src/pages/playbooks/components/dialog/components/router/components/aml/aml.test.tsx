import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import type { AMLProps } from './aml';
import Aml from './aml';

describe('Aml', () => {
  const renderAml = ({
    defaultValues = {
      enhancedAml: false,
      ofac: false,
      pep: false,
      adverseMedia: false,
    },
    isLoading = false,
    onBack = jest.fn(),
    onSubmit = jest.fn(),
  }: Partial<AMLProps>) => {
    customRender(
      <Aml
        defaultValues={defaultValues}
        isLoading={isLoading}
        onBack={onBack}
        onSubmit={onSubmit}
      />,
    );
  };

  describe('initial state', () => {
    it('should only show the "AML monitoring" option', () => {
      renderAml({});

      const aml = screen.getByRole('checkbox', { name: 'AML monitoring' });
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

  describe('when selecting "AML monitoring"', () => {
    it('should show the "AML monitoring" option', async () => {
      renderAml({});

      const aml = screen.getByRole('checkbox', { name: 'AML monitoring' });
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
      renderAml({ onSubmit });

      const aml = screen.getByRole('checkbox', { name: 'AML monitoring' });
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

      const submit = screen.getByRole('button', { name: 'Create' });
      await userEvent.click(submit);

      expect(onSubmit).toHaveBeenCalledWith({
        enhancedAml: true,
        ofac: true,
        pep: true,
        adverseMedia: true,
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
        defaultValues: {
          enhancedAml: true,
          ofac: true,
          pep: true,
          adverseMedia: true,
        },
      });

      const aml = screen.getByRole('checkbox', { name: 'AML monitoring' });
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
