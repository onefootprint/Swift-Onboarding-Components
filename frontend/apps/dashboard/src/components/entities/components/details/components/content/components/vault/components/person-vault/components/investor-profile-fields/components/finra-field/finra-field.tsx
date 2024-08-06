import { LinkButton, Text, useObjectUrl } from '@onefootprint/ui';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

import { IcoDownload16 } from '@onefootprint/icons';

export type FinraFieldProps = {
  base64Data: string;
};

const FinraField = ({ base64Data }: FinraFieldProps) => {
  const { t } = useTranslation();
  const { objectUrl } = useObjectUrl(base64Data);

  return objectUrl ? (
    <LinkButton
      iconComponent={IcoDownload16}
      onClick={() => {
        saveAs(objectUrl);
      }}
    >
      {t('download')}
    </LinkButton>
  ) : (
    <Text variant="body-3">-</Text>
  );
};

export default FinraField;
