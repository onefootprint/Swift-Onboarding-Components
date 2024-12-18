import { getCountryNameFromCode } from '@onefootprint/global-constants';
import type { CountrySpecificDocumentMapping, IdDocKind } from '@onefootprint/request-types/dashboard';
import type { CountryCode } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';
import useIdDocList from 'src/hooks/use-id-doc-list';

type CountrySpecificProps = {
  countrySpecific: CountrySpecificDocumentMapping;
  hasSelfie: boolean;
};

const CountrySpecific = ({ countrySpecific, hasSelfie }: CountrySpecificProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'data-collection' });
  const getText = useIdDocList();
  const sortedCountrySpecific = Object.entries(countrySpecific).sort(([countryA], [countryB]) =>
    countryA.localeCompare(countryB),
  ) as Array<[CountryCode, Array<IdDocKind>]>;
  const countries = sortedCountrySpecific.map(([country]) => country as CountryCode);
  const acceptedDocScans = sortedCountrySpecific.map(([, docTypes]) => docTypes);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-label-2">{t('gov-docs.country-specific.scans')}</p>
      <div className="flex flex-row gap-6 pl-2">
        {countries.length === 0 ? (
          <p className="text-body-2 text-tertiary">{t('gov-docs.country-specific.none')}</p>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              {countries.map(country => (
                <p key={country} className="text-body-2 text-secondary">
                  {getCountryNameFromCode(country)}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              {acceptedDocScans.map(docTypes => (
                <p key={docTypes.join('-')} className="text-body-2">
                  {docTypes.length > 0 ? (
                    <div className="flex flex-row gap-2">
                      <span className="text-tertiary">{getText(docTypes).join(', ')}</span>
                      {hasSelfie && (
                        <>
                          <span className="text-secondary">+</span>
                          <span className="text-tertiary">{t('gov-docs.selfie')}</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-body-2 text-secondary">{t('gov-docs.none')}</p>
                  )}
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CountrySpecific;
