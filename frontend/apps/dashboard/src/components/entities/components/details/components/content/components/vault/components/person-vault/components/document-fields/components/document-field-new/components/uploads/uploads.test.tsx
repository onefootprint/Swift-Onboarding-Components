import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import Uploads, { UploadsProps } from './uploads';
import {
  entityVaultWithIdCard,
  failedIdCardDocument,
  successfulIDCardDocument,
} from './uploads.test.config';

const renderUploads = ({ vault, currentDocument }: UploadsProps) =>
  customRender(<Uploads vault={vault} currentDocument={currentDocument} />);

describe('<Uploads />', () => {
  it('Should show correct labels for each upload if successful', () => {
    renderUploads({
      vault: entityVaultWithIdCard,
      currentDocument: successfulIDCardDocument,
    });

    expect(
      screen.getByText('Front ID successfully uploaded'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Back ID successfully uploaded'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Selfie successfully uploaded'),
    ).toBeInTheDocument();
  });

  it('Should show correct labels for each upload if failed', () => {
    renderUploads({
      vault: entityVaultWithIdCard,
      currentDocument: failedIdCardDocument,
    });

    expect(screen.getByText('Front ID upload failed')).toBeInTheDocument();
    expect(screen.getByText('Back ID upload failed')).toBeInTheDocument();
    expect(screen.getByText('Selfie upload failed')).toBeInTheDocument();
  });

  it('Should show correct date format for each upload', () => {
    renderUploads({
      vault: entityVaultWithIdCard,
      currentDocument: successfulIDCardDocument,
    });

    expect(screen.getByText('06:12 am')).toBeInTheDocument();
    expect(screen.getByText('03:16 am')).toBeInTheDocument();
    expect(screen.getByText('05:27 am')).toBeInTheDocument();
  });

  it('Should render each image', () => {
    renderUploads({
      vault: entityVaultWithIdCard,
      currentDocument: successfulIDCardDocument,
    });
    const images: HTMLImageElement[] = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    expect(images[0]?.src).toContain('data:image/jpg;base64,test ID front URL');
    expect(images[1]?.src).toContain('data:image/jpg;base64,test ID back URL');
    expect(images[2]?.src).toContain(
      'data:image/jpg;base64,test ID selfie URL',
    );
  });
});
