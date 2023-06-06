import { IcoCar24, IcoIdCard24, IcoPassport24 } from '@onefootprint/icons';
import { IdDocType } from '@onefootprint/types';

import useTranslation from '@/hooks/use-translation';

const useDocumentOptions = (availableTypes: IdDocType[]) => {
  const { t } = useTranslation('components.scan.doc-selection');
  const options = {
    [IdDocType.driversLicense]: {
      title: t('options.dl.title'),
      description: t('options.dl.description'),
      value: IdDocType.driversLicense,
      IconComponent: IcoCar24,
    },
    [IdDocType.idCard]: {
      title: t('options.id.title'),
      description: t('options.id.description'),
      value: IdDocType.idCard,
      IconComponent: IcoIdCard24,
    },
    [IdDocType.passport]: {
      title: t('options.passport.title'),
      description: t('options.passport.description'),
      value: IdDocType.passport,
      IconComponent: IcoPassport24,
    },
  };
  return availableTypes.map(type => options[type]);
};

export default useDocumentOptions;
