import { useTranslation } from '@onefootprint/hooks';
import {
  CountryCode,
  IdDocImageTypes,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import IdDocTypeToLabel from '../../constants/id-doc-type-labels';
import { getCountryFromCode } from '../../utils/get-country-from-code';

type DesktopHeaderProps = {
  type?: SupportedIdDocTypes;
  imageType: IdDocImageTypes;
  country?: CountryCode;
};

const DesktopHeader = ({ type, imageType, country }: DesktopHeaderProps) => {
  const { t } = useTranslation('components.desktop-header');

  const side =
    type === SupportedIdDocTypes.passport && IdDocImageTypes.front
      ? 'photo page'
      : `${imageType} side`;

  const typeLabel = type ? IdDocTypeToLabel[type] : '';
  const countryName = getCountryFromCode(country)?.label;

  let title = t('title.id-doc', {
    type: typeLabel,
    side,
  });
  if (imageType === IdDocImageTypes.selfie) {
    title = t('title.selfie');
  }

  let subtitle;
  if (imageType !== IdDocImageTypes.selfie) {
    t('subtitle', {
      country: countryName,
    });
  }

  return <HeaderTitle title={title} subtitle={subtitle} />;
};

export default DesktopHeader;
