import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';

import DocumentField, { DocumentFieldProps } from './document-field';
import driversLicensePartialDIs from './document-field.test.config';

const renderDocumentField = ({
  vault,
  label,
  documentType,
  documents,
}: DocumentFieldProps) =>
  customRender(
    <DocumentField
      vault={vault}
      label={label}
      documentType={documentType}
      documents={documents}
    />,
  );

describe('<DocumentField />', () => {
  it('should properly open drawer', async () => {
    renderDocumentField({
      vault: driversLicensePartialDIs,
      label: `Driver's license and selfie`,
      documentType: SupportedIdDocTypes.driversLicense,
      documents: [],
    });

    const show = screen.getByText('See details');
    expect(show).toBeInTheDocument();

    // drawer should not show beforehand

    let drawerCloseButton = screen.queryByLabelText('Close document details');
    expect(drawerCloseButton).not.toBeInTheDocument();

    await userEvent.click(show);

    // drawer should show after click
    await waitFor(() => {
      drawerCloseButton = screen.queryByLabelText('Close document details');
      expect(drawerCloseButton).toBeInTheDocument();
    });
  });
});
