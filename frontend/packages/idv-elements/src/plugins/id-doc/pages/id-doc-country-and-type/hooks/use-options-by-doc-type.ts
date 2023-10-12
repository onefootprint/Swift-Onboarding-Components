import { useTranslation } from '@onefootprint/hooks';
import {
  IcoCar24,
  IcoGreenCard24,
  IcoIdCard24,
  IcoPassport24,
  IcoVisaPassport24,
  IcoVoter24,
  IcoWork24,
} from '@onefootprint/icons';
import { SupportedIdDocTypes } from '@onefootprint/types';
import type { RadioSelectOptionFields } from '@onefootprint/ui';

const useOptionsByDocType = (supportedDocumentTypes: SupportedIdDocTypes[]) => {
  const { t } = useTranslation('pages.country-and-type-selection');

  const optionsByDocType: {
    [key in SupportedIdDocTypes]?: RadioSelectOptionFields;
  } = {};
  if (supportedDocumentTypes?.includes(SupportedIdDocTypes.passport)) {
    optionsByDocType[SupportedIdDocTypes.passport] = {
      title: t('form.type.passport.title'),
      IconComponent: IcoPassport24,
      value: SupportedIdDocTypes.passport,
    };
  }
  if (supportedDocumentTypes?.includes(SupportedIdDocTypes.driversLicense)) {
    optionsByDocType[SupportedIdDocTypes.driversLicense] = {
      title: t('form.type.driversLicense.title'),
      IconComponent: IcoCar24,
      value: SupportedIdDocTypes.driversLicense,
    };
  }
  if (supportedDocumentTypes?.includes(SupportedIdDocTypes.idCard)) {
    optionsByDocType[SupportedIdDocTypes.idCard] = {
      title: t('form.type.idCard.title'),
      IconComponent: IcoIdCard24,
      value: SupportedIdDocTypes.idCard,
    };
  }
  if (supportedDocumentTypes?.includes(SupportedIdDocTypes.visa)) {
    optionsByDocType[SupportedIdDocTypes.visa] = {
      title: t('form.type.visa.title'),
      IconComponent: IcoVisaPassport24,
      value: SupportedIdDocTypes.visa,
    };
  }
  if (supportedDocumentTypes?.includes(SupportedIdDocTypes.workPermit)) {
    optionsByDocType[SupportedIdDocTypes.workPermit] = {
      title: t('form.type.workPermit.title'),
      IconComponent: IcoWork24,
      value: SupportedIdDocTypes.workPermit,
    };
  }
  if (supportedDocumentTypes?.includes(SupportedIdDocTypes.residenceDocument)) {
    optionsByDocType[SupportedIdDocTypes.residenceDocument] = {
      title: t('form.type.residenceDocument.title'),
      IconComponent: IcoGreenCard24,
      value: SupportedIdDocTypes.residenceDocument,
    };
  }
  if (
    supportedDocumentTypes?.includes(SupportedIdDocTypes.voterIdentification)
  ) {
    optionsByDocType[SupportedIdDocTypes.voterIdentification] = {
      title: t('form.type.voterIdentification.title'),
      IconComponent: IcoVoter24,
      value: SupportedIdDocTypes.voterIdentification,
    };
  }

  return optionsByDocType;
};

export default useOptionsByDocType;
