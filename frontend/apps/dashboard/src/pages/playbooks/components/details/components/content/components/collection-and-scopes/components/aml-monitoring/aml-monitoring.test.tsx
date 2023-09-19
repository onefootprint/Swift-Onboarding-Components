import { customRender, screen, within } from '@onefootprint/test-utils';
import React from 'react';

import type { AmlMonitoringProps } from './aml-monitoring';
import AmlMonitoring from './aml-monitoring';

describe('<AmlMonitoring />', () => {
  const renderAmlMonitoring = ({
    adverseMedia = false,
    enhancedAml = false,
    ofac = false,
    pep = false,
  }: Partial<AmlMonitoringProps>) =>
    customRender(
      <AmlMonitoring
        adverseMedia={adverseMedia}
        enhancedAml={enhancedAml}
        ofac={ofac}
        pep={pep}
      />,
    );

  describe('AML monitoring', () => {
    it('should show a check icon', () => {
      renderAmlMonitoring({ enhancedAml: true });

      const aml = screen.getByRole('row', { name: 'Enhanced AML monitoring' });
      const enabled = within(aml).getByRole('img', { name: 'Enabled' });
      expect(enabled).toBeInTheDocument();
    });

    it('should show a disabled icon', () => {
      renderAmlMonitoring({ enhancedAml: false });

      const aml = screen.getByRole('row', { name: 'Enhanced AML monitoring' });
      const disabled = within(aml).getByRole('img', { name: 'Disabled' });
      expect(disabled).toBeInTheDocument();
    });
  });

  describe('OFAC monitoring', () => {
    it('should show a check icon', () => {
      renderAmlMonitoring({ ofac: true });

      const ofac = screen.getByRole('row', {
        name: 'Office of Foreign Assets Control (OFAC)',
      });
      const enabled = within(ofac).getByRole('img', { name: 'Enabled' });
      expect(enabled).toBeInTheDocument();
    });

    it('should show a disabled icon', () => {
      renderAmlMonitoring({ ofac: false });

      const ofac = screen.getByRole('row', {
        name: 'Office of Foreign Assets Control (OFAC)',
      });
      const disabled = within(ofac).getByRole('img', { name: 'Disabled' });
      expect(disabled).toBeInTheDocument();
    });
  });

  describe('when it has PEP enabled', () => {
    it('should show a check icon', () => {
      renderAmlMonitoring({ pep: true });

      const pep = screen.getByRole('row', {
        name: 'Politically Exposed Person (PEP)',
      });
      const enabled = within(pep).getByRole('img', { name: 'Enabled' });
      expect(enabled).toBeInTheDocument();
    });

    it('should show a disabled icon', () => {
      renderAmlMonitoring({ pep: false });

      const pep = screen.getByRole('row', {
        name: 'Politically Exposed Person (PEP)',
      });
      const disabled = within(pep).getByRole('img', { name: 'Disabled' });
      expect(disabled).toBeInTheDocument();
    });
  });

  describe('when it has Adverse Media enabled', () => {
    it('should show a check icon', () => {
      renderAmlMonitoring({ adverseMedia: true });

      const adverseMedia = screen.getByRole('row', {
        name: 'Adverse media',
      });
      const enabled = within(adverseMedia).getByRole('img', {
        name: 'Enabled',
      });
      expect(enabled).toBeInTheDocument();
    });

    it('should show a disabled icon', () => {
      renderAmlMonitoring({ adverseMedia: false });

      const adverseMedia = screen.getByRole('row', {
        name: 'Adverse media',
      });
      const disabled = within(adverseMedia).getByRole('img', {
        name: 'Disabled',
      });
      expect(disabled).toBeInTheDocument();
    });
  });
});
