import type { CountryCode } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

import { HeaderTitle } from '../../../../components';
import { getCountryFromCode } from '../../utils/get-country-from-code';

type DesktopHeaderProps = {
  docName?: string;
  sideName?: string;
  country?: CountryCode;
  isSelfie?: boolean;
};

const DesktopHeader = ({ docName, sideName, country, isSelfie }: DesktopHeaderProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.components.desktop-header',
  });

  // TODO: these probably need to be translated
  const countryName = getCountryFromCode(country)?.label;
  let title: string = `${docName}`;
  if (!docName) title = `${sideName}`;
  if (docName && sideName) title = `${docName} · ${sideName}`;

  let subtitle;
  if (!isSelfie && countryName) {
    subtitle = t('subtitle', {
      country: countryName,
    });
  }

  return <HeaderTitle title={title} subtitle={subtitle} />;
};

export default DesktopHeader;
