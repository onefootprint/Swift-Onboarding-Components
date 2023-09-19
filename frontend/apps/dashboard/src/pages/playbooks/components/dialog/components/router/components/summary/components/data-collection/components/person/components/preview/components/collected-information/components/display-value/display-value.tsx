import { useTranslation } from '@onefootprint/hooks';
import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import type { SupportedIdDocTypes } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import IdDocDisplay from '@/playbooks/components/id-doc-display';

import type { Option } from '../../collected-information.types';

type DisplayValueProps =
  | {
      name: 'dob';
      value: Option['dob'];
    }
  | {
      name: 'email';
      value: Option['email'];
    }
  | {
      name: 'fullAddress';
      value: Option['fullAddress'];
    }
  | {
      name: 'idDocKind';
      value: Option['idDocKind'];
    }
  | {
      name: 'phoneNumber';
      value: Option['phoneNumber'];
    }
  | {
      name: 'selfie';
      value: Option['selfie'];
    }
  | {
      name: 'ssn';
      value: Option['ssn'];
    }
  | {
      name: 'usLegalStatus';
      value: Option['usLegalStatus'];
    }
  | {
      name: string;
      value: any;
    };

const DisplayValue = ({ name, value }: DisplayValueProps) => {
  const { t } = useTranslation('pages.playbooks.dialog.summary.form.person');

  if (typeof value === 'boolean') {
    return value ? <IcoCheck24 /> : <IcoCloseSmall24 />;
  }

  if (name === 'idDocKind') {
    return <IdDocDisplay idDocKind={value as SupportedIdDocTypes[]} />;
  }

  if (name === 'ssn') {
    if (value.active) {
      return (
        <Typography variant="body-3">
          {t(`preview.${value.kind}`)}{' '}
          {value.optional ? t('preview.optional') : ''}
        </Typography>
      );
    }
    return <IcoCloseSmall24 />;
  }

  return null;
};

export default DisplayValue;
