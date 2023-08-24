import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import IdDocDisplay from '@/playbooks/components/id-doc-display';
import { PersonalInformationAndDocs } from '@/playbooks/utils/machine/types';

type DisplayValueProps = {
  field: keyof PersonalInformationAndDocs;
  personalInfoAndDocs: PersonalInformationAndDocs;
};

const DisplayValue = ({ field, personalInfoAndDocs }: DisplayValueProps) => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.your-playbook.form.personal-info-and-docs',
  );

  const value = personalInfoAndDocs[field];
  const { idDocKind, idDoc } = personalInfoAndDocs;

  if (field === 'ssnKind') {
    return <Typography variant="body-3">{t(`preview.${value}`)}</Typography>;
  }
  if (field === 'idDocKind') {
    return <IdDocDisplay idDocKind={idDocKind} />;
  }
  if (field === 'selfie' && (!idDoc || !idDocKind.length)) {
    return <IcoCloseSmall24 testID="close-icon" />;
  }
  if (typeof value === 'boolean') {
    if (value) {
      return <IcoCheck24 testID="check-icon" />;
    }
    return <IcoCloseSmall24 testID="close-icon" />;
  }

  return null;
};

export default DisplayValue;
