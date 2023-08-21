import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import { CollectedKycDataOption } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

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

  if (field === CollectedKycDataOption.fullAddress) {
    return (
      <Typography variant="body-3">{t(`preview.address-display`)}</Typography>
    );
  }
  if (field === 'ssnKind') {
    return <Typography variant="body-3">{t(`preview.${value}`)}</Typography>;
  }
  if (field === 'idDocKind') {
    const possibleIdDocs = personalInfoAndDocs.idDocKind
      .map(k => t(`preview.${k as string}`))
      .join(', ');
    return <Typography variant="body-3">{possibleIdDocs}</Typography>;
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
