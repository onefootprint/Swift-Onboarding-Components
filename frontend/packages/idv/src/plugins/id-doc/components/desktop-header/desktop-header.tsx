import type { CountryCode, SupportedIdDocTypes } from '@onefootprint/types';
import { IdDocImageTypes } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { HeaderTitle } from '../../../../components';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import { getCountryFromCode } from '../../utils/get-country-from-code';
import getImageSideLabel from '../../utils/get-image-side-label';

type DesktopHeaderProps = {
  type?: SupportedIdDocTypes;
  imageType: IdDocImageTypes;
  country?: CountryCode;
};

const DesktopHeader = ({ type, imageType, country }: DesktopHeaderProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'id-doc.components.desktop-header',
  });

  const side = getImageSideLabel(imageType, type);

  const typeLabel = type ? IdDocTypeToLabel[type] : '';
  const countryName = getCountryFromCode(country)?.label;
  const docName = t('title.doc-name.id-doc', {
    type: typeLabel,
  });
  const sideName = side
    ? ` · ${t('title.side-name.id-doc', {
        side,
      })}`
    : '';

  let title: string = `${docName}${sideName}`;
  if (imageType === IdDocImageTypes.selfie) {
    title = t('title.selfie');
  }

  let subtitle;
  if (imageType !== IdDocImageTypes.selfie) {
    subtitle = t('subtitle', {
      country: countryName,
    });
  }

  return <HeaderTitle title={title} subtitle={subtitle} />;
};

export default DesktopHeader;
