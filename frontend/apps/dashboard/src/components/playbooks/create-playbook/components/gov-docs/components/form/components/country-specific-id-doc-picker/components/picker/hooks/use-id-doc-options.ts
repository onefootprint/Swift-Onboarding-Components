import { SupportedIdDocTypes } from '@onefootprint/types';
import useIdDocText from 'src/hooks/use-id-doc-text';

const useIdDocOptions = () => {
  const t = useIdDocText();
  const options = [
    {
      value: SupportedIdDocTypes.driversLicense,
      label: t(SupportedIdDocTypes.driversLicense),
    },
    {
      value: SupportedIdDocTypes.passport,
      label: t(SupportedIdDocTypes.passport),
    },
    {
      value: SupportedIdDocTypes.passportCard,
      label: t(SupportedIdDocTypes.passportCard),
    },
    {
      value: SupportedIdDocTypes.idCard,
      label: t(SupportedIdDocTypes.idCard),
    },
    {
      value: SupportedIdDocTypes.residenceDocument,
      label: t(SupportedIdDocTypes.residenceDocument),
    },
    {
      value: SupportedIdDocTypes.workPermit,
      label: t(SupportedIdDocTypes.workPermit),
    },
    {
      value: SupportedIdDocTypes.visa,
      label: t(SupportedIdDocTypes.visa),
    },
    {
      value: SupportedIdDocTypes.voterIdentification,
      label: t(SupportedIdDocTypes.voterIdentification),
    },
  ];

  return options;
};

export default useIdDocOptions;
