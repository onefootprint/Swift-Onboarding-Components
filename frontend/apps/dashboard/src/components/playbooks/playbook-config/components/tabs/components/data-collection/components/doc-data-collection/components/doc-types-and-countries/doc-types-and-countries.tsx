import type { DocumentAndCountryConfiguration } from '@onefootprint/request-types/dashboard';
import { Divider } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import CountrySpecific from '../../../country-specific';
import Global from '../../../global';

type DocTypesAndCountriesProps = {
  documentTypesAndCountries: DocumentAndCountryConfiguration;
  hasSelfie: boolean;
};

const DocTypesAndCountries = ({ documentTypesAndCountries, hasSelfie }: DocTypesAndCountriesProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'data-collection' });
  const { global, countrySpecific } = documentTypesAndCountries;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <p className="text-label-3 text-secondary">{t('gov-docs.title')}</p>
        <Divider variant="secondary" />
      </div>
      <Global global={global} hasSelfie={hasSelfie} />
      <CountrySpecific countrySpecific={countrySpecific} hasSelfie={hasSelfie} />
    </div>
  );
};

export default DocTypesAndCountries;
