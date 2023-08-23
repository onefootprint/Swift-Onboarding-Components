import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import {
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import React from 'react';
import { asAdminUser, asAdminUserFirmEmployee } from 'src/config/tests';

import { Kind } from '@/playbooks/utils/machine/types';

import PreviewWithContext, {
  PreviewWithContextProps,
} from './preview.test.config';

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

  it('should show SSN only once when we are showing', () => {
    renderForm({
      startingValues: { ssn: true, ssnKind: CollectedKycDataOption.ssn9 },
    });
    expect(screen.getAllByText('SSN').length).toBe(1);
  });

  it("should show ID doc only once when we aren't showing", () => {
    renderForm({ startingValues: { idDoc: false } });
    expect(screen.getAllByText('ID document scan').length).toBe(1);
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
    expect(screen.getAllByText('ID document scan').length).toBe(1);
  });

  it('should show correct title for KYC flow', () => {
    renderForm({ kind: Kind.KYC });
    expect(screen.getByText('Personal information & docs')).toBeInTheDocument();
  });

  it('should show correct title for KYB flow', async () => {
    renderForm({ kind: Kind.KYB });
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

  it('should show doc first flow option if firm employee and ID doc kind exists', async () => {
    asAdminUserFirmEmployee();
    renderForm({
      kind: Kind.KYC,
      startingValues: {
        idDoc: true,
        idDocKind: [SupportedIdDocTypes.driversLicense],
      },
    });
    expect(
      screen.getByRole('checkbox', {
        name: 'Use document scan to autofill basic identity data',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Normally, users scan their documents after typing in their personal data. This configuration allows us to pre-fill the personal data based on OCRed information after they do the scan.',
      ),
    ).toBeInTheDocument();
  });

  it('should not show doc first flow option if firm employee but no ID doc kind shown', async () => {
    asAdminUserFirmEmployee();
    renderForm({
      kind: Kind.KYC,
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
      kind: Kind.KYC,
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
