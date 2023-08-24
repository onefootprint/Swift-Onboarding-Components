import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import { SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';

import IdDocDisplay, { IdDocDisplayProps } from './id-doc-display';

const renderIdDocDisplay = ({ idDocKind, threshold }: IdDocDisplayProps) =>
  customRender(<IdDocDisplay idDocKind={idDocKind} threshold={threshold} />);

describe('<IdDocDisplay />', () => {
  it('should render null if threshold is not 2 or 3', () => {
    renderIdDocDisplay({
      idDocKind: [SupportedIdDocTypes.driversLicense],
      threshold: 0,
    });
    expect(screen.queryByText("Driver's license")).not.toBeInTheDocument();
  });

  it('should display single ID doc kind properly', () => {
    renderIdDocDisplay({
      idDocKind: [SupportedIdDocTypes.driversLicense],
    });
    expect(screen.getByText("Driver's license")).toBeInTheDocument();
  });

  it('should display 2 ID docs properly', () => {
    renderIdDocDisplay({
      idDocKind: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.passport,
      ],
    });
    expect(screen.getByText("Driver's license, Passport")).toBeInTheDocument();
  });

  it('should display 3 ID docs properly', () => {
    renderIdDocDisplay({
      idDocKind: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.passport,
        SupportedIdDocTypes.idCard,
      ],
    });
    expect(
      screen.getByText("Driver's license, Passport, Identity card"),
    ).toBeInTheDocument();
  });

  it('should display 4 ID docs properly', async () => {
    renderIdDocDisplay({
      idDocKind: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.passport,
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.residenceDocument,
      ],
    });
    expect(
      screen.getByText("Driver's license, Passport, and"),
    ).toBeInTheDocument();

    const twoMore = screen.getByText('2 more');
    expect(twoMore).toBeInTheDocument();
    await userEvent.hover(twoMore);
    const tooltip = screen.getByRole('tooltip', {
      name: 'Identity card, Residence card',
    });
    expect(tooltip).toBeInTheDocument();
  });

  it('should display 5 ID docs properly', async () => {
    renderIdDocDisplay({
      idDocKind: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.passport,
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.residenceDocument,
        SupportedIdDocTypes.workPermit,
      ],
    });
    expect(
      screen.getByText("Driver's license, Passport, and"),
    ).toBeInTheDocument();

    const threeMore = screen.getByText('3 more');
    expect(threeMore).toBeInTheDocument();
    await userEvent.hover(threeMore);
    const tooltip = screen.getByRole('tooltip', {
      name: 'Identity card, Residence card, Work permit',
    });
    expect(tooltip).toBeInTheDocument();
  });

  it('should display all 6 ID docs properly', async () => {
    renderIdDocDisplay({
      idDocKind: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.passport,
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.residenceDocument,
        SupportedIdDocTypes.workPermit,
        SupportedIdDocTypes.visa,
      ],
    });
    expect(
      screen.getByText("Driver's license, Passport, and"),
    ).toBeInTheDocument();
  });

  it('should display 2 ID docs properly with threshold 2', () => {
    renderIdDocDisplay({
      idDocKind: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.passport,
      ],
      threshold: 2,
    });
    expect(screen.getByText("Driver's license, Passport")).toBeInTheDocument();
  });

  it('should display 3 ID docs properly with threshold 2', async () => {
    renderIdDocDisplay({
      idDocKind: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.passport,
        SupportedIdDocTypes.idCard,
      ],
      threshold: 2,
    });
    expect(screen.getByText("Driver's license and")).toBeInTheDocument();
    const twoMore = screen.getByText('2 more');
    expect(twoMore).toBeInTheDocument();
    await userEvent.hover(twoMore);
    const tooltip = screen.getByRole('tooltip', {
      name: 'Passport, Identity card',
    });
    expect(tooltip).toBeInTheDocument();
  });

  it('should display 4 ID docs properly with threshold 2', async () => {
    renderIdDocDisplay({
      idDocKind: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.passport,
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.residenceDocument,
      ],
      threshold: 2,
    });
    expect(screen.getByText("Driver's license and")).toBeInTheDocument();

    const threeMode = screen.getByText('3 more');
    expect(threeMode).toBeInTheDocument();
    await userEvent.hover(threeMode);
    const tooltip = screen.getByRole('tooltip', {
      name: 'Passport, Identity card, Residence card',
    });
    expect(tooltip).toBeInTheDocument();
  });

  it('should display 5 ID docs properly with threshold 2', async () => {
    renderIdDocDisplay({
      idDocKind: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.passport,
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.residenceDocument,
        SupportedIdDocTypes.workPermit,
      ],
      threshold: 2,
    });
    expect(screen.getByText("Driver's license and")).toBeInTheDocument();

    const fourMore = screen.getByText('4 more');
    expect(fourMore).toBeInTheDocument();
    await userEvent.hover(fourMore);
    const tooltip = screen.getByRole('tooltip', {
      name: 'Passport, Identity card, Residence card, Work permit',
    });
    expect(tooltip).toBeInTheDocument();
  });

  it('should display all 6 ID docs properly with threshold 2', async () => {
    renderIdDocDisplay({
      idDocKind: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.passport,
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.residenceDocument,
        SupportedIdDocTypes.workPermit,
        SupportedIdDocTypes.visa,
      ],
      threshold: 2,
    });
    expect(screen.getByText("Driver's license and")).toBeInTheDocument();

    const fiveMore = screen.getByText('5 more');
    expect(fiveMore).toBeInTheDocument();
    await userEvent.hover(fiveMore);
    const tooltip = screen.getByRole('tooltip', {
      name: 'Passport, Identity card, Residence card, Work permit, Visa',
    });
    expect(tooltip).toBeInTheDocument();
  });
});
