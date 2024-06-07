import React from 'react';

import CompanyPhotosDesktop from './company-photos-desktop';
import CompanyPhotosMobile from './company-photos-mobile';
import type { CompanyPhoto } from './company-photos.types';

type CompanyPhotosProps = {
  photos: CompanyPhoto[];
};

const CompanyPhotos = ({ photos }: CompanyPhotosProps) => (
  <>
    <CompanyPhotosDesktop photos={photos} />
    <CompanyPhotosMobile photos={photos} />
  </>
);

export default CompanyPhotos;
