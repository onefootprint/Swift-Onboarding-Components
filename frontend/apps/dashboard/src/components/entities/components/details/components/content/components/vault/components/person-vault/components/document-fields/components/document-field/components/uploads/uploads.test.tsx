import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import type { UploadsProps } from './uploads';
import Uploads from './uploads';
import {
  entityVaultWithIdCard,
  failedIdCardDocument,
  idCardApi,
  idCardDesktop,
  idCardMobile,
  successfulIDCardDocument,
} from './uploads.test.config';

const renderUploads = ({ vault, currentDocument }: UploadsProps) =>
  customRender(<Uploads vault={vault} currentDocument={currentDocument} />);

describe('<Uploads />', () => {
  window.URL.createObjectURL = jest.fn(() => 'http://127.0.0.1:0000/a-blob-url');
  window.URL.revokeObjectURL = jest.fn(() => undefined);

  it('should show correct labels for each upload if successful', () => {
    renderUploads({
      vault: entityVaultWithIdCard,
      currentDocument: successfulIDCardDocument,
    });

    expect(screen.getByText('ID (FRONT) successfully uploaded')).toBeInTheDocument();
    expect(screen.getByText('ID (BACK) successfully uploaded')).toBeInTheDocument();
    expect(screen.getByText('Selfie successfully uploaded')).toBeInTheDocument();
  });

  it('should show correct labels for each upload if failed', () => {
    renderUploads({
      vault: entityVaultWithIdCard,
      currentDocument: failedIdCardDocument,
    });

    expect(screen.getByText('ID (FRONT) upload failed')).toBeInTheDocument();
    expect(screen.getByText('ID (BACK) upload failed')).toBeInTheDocument();
    expect(screen.getByText('Selfie upload failed')).toBeInTheDocument();
  });

  it('should show correct date format for each upload', () => {
    renderUploads({
      vault: entityVaultWithIdCard,
      currentDocument: successfulIDCardDocument,
    });

    expect(screen.getByText('06:12 am')).toBeInTheDocument();
    expect(screen.getByText('03:16 am')).toBeInTheDocument();
    expect(screen.getByText('05:27 am')).toBeInTheDocument();
  });

  it('should render each image', () => {
    renderUploads({
      vault: entityVaultWithIdCard,
      currentDocument: successfulIDCardDocument,
    });
    const images = screen.getAllByRole('img').filter(el => el.tagName === 'IMG') as HTMLImageElement[];

    expect(images).toHaveLength(3);
    expect(images[0]?.src).toContain('a-blob-url');
    expect(images[1]?.src).toContain('a-blob-url');
    expect(images[2]?.src).toContain('a-blob-url');
  });

  it('should show proper upload source for mobile uploads', () => {
    renderUploads({
      vault: entityVaultWithIdCard,
      currentDocument: idCardMobile,
    });
    expect(screen.getByText('Uploaded via mobile')).toBeInTheDocument();
  });

  it('should show proper upload source for desktop uploads', () => {
    renderUploads({
      vault: entityVaultWithIdCard,
      currentDocument: idCardDesktop,
    });
    expect(screen.getByText('Uploaded via desktop')).toBeInTheDocument();
  });

  it('should show API upload souce for API uploads', () => {
    renderUploads({
      vault: entityVaultWithIdCard,
      currentDocument: idCardApi,
    });
    expect(screen.getByText('Uploaded via API')).toBeInTheDocument();
  });
});
