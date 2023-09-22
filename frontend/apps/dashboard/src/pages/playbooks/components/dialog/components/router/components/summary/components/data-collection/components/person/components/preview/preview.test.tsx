import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import {
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import React from 'react';
import {
  asAdminUser,
  asAdminUserFirmEmployee,
  asAdminUserInOrg,
} from 'src/config/tests';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

import type { PreviewWithContextProps } from './preview.test.config';
import PreviewWithContext from './preview.test.config';

const renderForm = ({ startingValues, kind }: PreviewWithContextProps) => {
  customRender(
    <PreviewWithContext startingValues={startingValues} kind={kind} />,
  );
};

describe('<Preview />', () => {
  it("should show SSN only once when we aren't showing", () => {
    renderForm({ startingValues: { ssn: false } });
    expect(screen.getAllByText('SSN').length).toBe(1);
  });

  it('should show labels for all options', () => {
    renderForm({});
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone number')).toBeInTheDocument();
    expect(screen.getByText('Date of birth')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Legal status in the U.S.')).toBeInTheDocument();
    expect(screen.getByText('SSN')).toBeInTheDocument();
    expect(screen.getByText('Doc. scan types')).toBeInTheDocument();
  });

  it('should show SSN only once when we are showing', () => {
    renderForm({
      startingValues: { ssn: true, ssnKind: CollectedKycDataOption.ssn9 },
    });
    expect(screen.getAllByText('SSN').length).toBe(1);
  });

  it("should show ID doc only once when we aren't showing", () => {
    renderForm({ startingValues: { idDoc: false } });
    expect(screen.getAllByText('Doc. scan types').length).toBe(1);
  });

  it('should show ID doc only once when we are showing', () => {
    renderForm({
      startingValues: {
        idDoc: true,
        idDocKind: [
          SupportedIdDocTypes.idCard,
          SupportedIdDocTypes.driversLicense,
        ],
      },
    });
    expect(screen.getAllByText('Doc. scan types').length).toBe(1);
  });

  it('should show correct title for KYC flow', () => {
    renderForm({ kind: PlaybookKind.Kyc });
    expect(screen.getByText('Personal information & docs')).toBeInTheDocument();
  });

  it('should show correct title for KYB flow', async () => {
    renderForm({ kind: PlaybookKind.Kyb });
    expect(screen.getByText('KYC of a beneficial owner')).toBeInTheDocument();
    const tooltip = screen.getByTestId('info-tooltip');
    expect(tooltip).toBeInTheDocument();
    await userEvent.click(tooltip);
    expect(
      screen.getAllByText(
        "To successfully verify a business we also need to verify its beneficial owner's identity.",
      ).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('should show doc first flow option if firm employee and ID doc kind exists and kind is KYC', async () => {
    asAdminUserFirmEmployee();
    renderForm({
      kind: PlaybookKind.Kyc,
      startingValues: {
        idDoc: true,
        idDocKind: [SupportedIdDocTypes.driversLicense],
      },
    });

    const checkbox = screen.getByRole('checkbox', {
      name: 'Use document scan to autofill basic identity data',
    });
    expect(checkbox).toBeInTheDocument();
  });
  it('should show doc first flow option if flexcar employee', async () => {
    asAdminUserInOrg('flexcar');
    renderForm({
      kind: PlaybookKind.Kyc,
      startingValues: {
        idDoc: true,
        idDocKind: [SupportedIdDocTypes.driversLicense],
      },
    });

    const checkbox = screen.getByRole('checkbox', {
      name: 'Use document scan to autofill basic identity data',
    });
    expect(checkbox).toBeInTheDocument();
  });

  it('should NOT doc first flow option if firm employee and ID doc kind exists BUT kind is KYB', async () => {
    asAdminUserFirmEmployee();
    renderForm({
      kind: PlaybookKind.Kyb,
      startingValues: {
        idDoc: true,
        idDocKind: [SupportedIdDocTypes.driversLicense],
      },
    });
    expect(
      screen.queryByRole('checkbox', {
        name: 'Use document scan to autofill basic identity data',
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole(
        'Normally, users scan their documents after typing in their personal data. This configuration allows us to pre-fill the personal data based on OCRed information after they do the scan.',
      ),
    ).not.toBeInTheDocument();
  });

  it('should not show doc first flow option if firm employee but no ID doc kind shown', async () => {
    asAdminUserFirmEmployee();
    renderForm({
      kind: PlaybookKind.Kyc,
      startingValues: {
        idDoc: true,
        idDocKind: [],
      },
    });
    expect(
      screen.queryByRole('checkbox', {
        name: 'Use document scan to autofill basic identity data',
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole(
        'Normally, users scan their documents after typing in their personal data. This configuration allows us to pre-fill the personal data based on OCRed information after they do the scan.',
      ),
    ).not.toBeInTheDocument();
  });

  it('should not show doc first flow option if non-firm employee', async () => {
    asAdminUser();
    renderForm({
      kind: PlaybookKind.Kyc,
      startingValues: {
        idDoc: true,
        idDocKind: [
          SupportedIdDocTypes.driversLicense,
          SupportedIdDocTypes.idCard,
        ],
      },
    });
    expect(
      screen.queryByRole('checkbox', {
        name: 'Use document scan to autofill basic identity data',
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole(
        'Normally, users scan their documents after typing in their personal data. This configuration allows us to pre-fill the personal data based on OCRed information after they do the scan.',
      ),
    ).not.toBeInTheDocument();
  });
});
