import { customRender, mockRouter, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { SupportedIdDocTypes } from '@onefootprint/types';

import TestWrapper from '../../../../../utils/test-wrapper';
import type { DocumentFieldProps } from './document-field';
import DocumentField from './document-field';
import driversLicensePartialDIs, { entityId } from './document-field.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

const renderDocumentField = ({ vault, documentType, documents }: DocumentFieldProps) =>
  customRender(
    <TestWrapper>
      <DocumentField vault={vault} documentType={documentType} documents={documents} />,
    </TestWrapper>,
  );

describe('<DocumentField />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl(`/entities/${entityId}&mode=sandbox`);
    mockRouter.query = {
      id: entityId,
    };
  });
  it('should properly open drawer', async () => {
    renderDocumentField({
      vault: driversLicensePartialDIs,
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
