import React from 'react';

import { CompanyPhoto } from './company-photos.types';
import CompanyPhotosDesktop from './company-photos-desktop';
import CompanyPhotosMobile from './company-photos-mobile';

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
