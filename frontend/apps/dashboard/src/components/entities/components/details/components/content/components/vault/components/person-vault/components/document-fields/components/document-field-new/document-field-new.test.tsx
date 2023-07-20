import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';

import DocumentField, { DocumentFieldProps } from './document-field-new';
import driversLicensePartialDIs from './document-field-new.test.config';

const renderDocumentField = ({
  vault,
  label,
  documentKind,
}: DocumentFieldProps) =>
  customRender(
    <DocumentField vault={vault} label={label} documentKind={documentKind} />,
  );

describe('<DocumentField />', () => {
  it('should properly open drawer', async () => {
    renderDocumentField({
      vault: driversLicensePartialDIs,
      label: `Driver's license and selfie`,
      documentKind: SupportedIdDocTypes.driversLicense,
    });

    const show = screen.getByText('Show');
    expect(show).toBeInTheDocument();

    // drawer should not show beforehand

    let drawerCloseButton = screen.queryByLabelText('drawer-close-button');
    expect(drawerCloseButton).not.toBeInTheDocument();

    await userEvent.click(show);

    // drawer should show after click
    await waitFor(() => {
      drawerCloseButton = screen.queryByLabelText('drawer-close-button');
      expect(drawerCloseButton).toBeInTheDocument();
    });
  });
});
