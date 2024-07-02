import { customRender, screen } from '@onefootprint/test-utils';
import { CollectedKycDataOption } from '@onefootprint/types';
import React from 'react';

import type { DisplayValueProps } from './display-value';
import DisplayValue from './display-value';

const renderDisplayValues = ({ field, mustCollectData, optionalData }: DisplayValueProps) =>
  customRender(<DisplayValue field={field} mustCollectData={mustCollectData} optionalData={optionalData} />);

describe('<DisplayValue />', () => {
  it('should show checkmark if field is in attributes', () => {
    renderDisplayValues({
      mustCollectData: [CollectedKycDataOption.name, CollectedKycDataOption.email],
      field: CollectedKycDataOption.name,
    });
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('should show close icon if field is not attributes', () => {
    renderDisplayValues({
      mustCollectData: [CollectedKycDataOption.name, CollectedKycDataOption.email],
      field: CollectedKycDataOption.address,
    });
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  it('should display check for selfie if document param includes it', () => {
    renderDisplayValues({
      mustCollectData: [
        CollectedKycDataOption.name,
        CollectedKycDataOption.email,
        'document.drivers_license,id_card.us_only.require_selfie',
      ],
      field: 'selfie',
    });
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('should display X for selfie if document param does not have it', () => {
    renderDisplayValues({
      mustCollectData: [
        CollectedKycDataOption.name,
        CollectedKycDataOption.email,
        'document.drivers_license,id_card.us_only.none',
      ],
      field: 'selfie',
    });
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  it('should display X for selfie if no document param', () => {
    renderDisplayValues({
      mustCollectData: [CollectedKycDataOption.name, CollectedKycDataOption.email],
      field: 'selfie',
    });
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  describe('ssn', () => {
    it('should show "last 4" if SSN4 is included', () => {
      renderDisplayValues({
        mustCollectData: [CollectedKycDataOption.ssn4, CollectedKycDataOption.name, CollectedKycDataOption.email],
        field: 'ssn',
      });

      expect(screen.getByText('Last 4')).toBeInTheDocument();
    });

    it('should show "Full" if SSN9 is included', () => {
      renderDisplayValues({
        mustCollectData: [CollectedKycDataOption.ssn9, CollectedKycDataOption.name, CollectedKycDataOption.email],
        field: 'ssn',
      });
      expect(screen.getByText('Full')).toBeInTheDocument();
    });

    it('should show close icon SSN is not included', () => {
      renderDisplayValues({
        mustCollectData: [CollectedKycDataOption.name, CollectedKycDataOption.email],
        field: 'ssn',
      });
      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });

    it('should show "Last 4 (Optional)" if SSN4 is optional', () => {
      renderDisplayValues({
        mustCollectData: [CollectedKycDataOption.name, CollectedKycDataOption.email],
        optionalData: [CollectedKycDataOption.ssn4],
        field: 'ssn',
      });
      expect(screen.getByText('Last 4 (Optional)')).toBeInTheDocument();
    });

    it('should show "Full (Optional)" if SSN9 is optional', () => {
      renderDisplayValues({
        mustCollectData: [CollectedKycDataOption.name, CollectedKycDataOption.email],
        optionalData: [CollectedKycDataOption.ssn9],
        field: 'ssn',
      });

      expect(screen.getByText('Full (Optional)')).toBeInTheDocument();
    });
  });
});
