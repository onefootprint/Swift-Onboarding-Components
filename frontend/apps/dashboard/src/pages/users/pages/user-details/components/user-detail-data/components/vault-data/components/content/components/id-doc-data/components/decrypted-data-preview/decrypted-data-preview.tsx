import { useTranslation } from '@onefootprint/hooks';
import { DecryptedIdDoc, DecryptedIdDocStatus } from '@onefootprint/types';
import { Tab, Tabs } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import ImagesPreview from '../images-preview';

type DecryptedDataPreviewProps = {
  images: DecryptedIdDoc[];
};

const DecryptedDataPreview = ({ images }: DecryptedDataPreviewProps) => {
  const { t } = useTranslation('pages.user-details.user-info.id-doc.preview');
  const successfulUploads = images.filter(
    image => image.status === DecryptedIdDocStatus.success,
  );
  const failedUploads = images.filter(
    image => image.status === DecryptedIdDocStatus.fail,
  );
  const [tab, setTab] = useState<DecryptedIdDocStatus>(
    successfulUploads.length > 0
      ? DecryptedIdDocStatus.success
      : DecryptedIdDocStatus.fail,
  );

  if (!images.length) {
    return null;
  }

  return (
    <Container>
      <Tabs variant="underlined">
        {successfulUploads.length > 0 && (
          <Tab
            key={DecryptedIdDocStatus.success}
            onClick={() => setTab(DecryptedIdDocStatus.success)}
            selected={tab === DecryptedIdDocStatus.success}
          >
            {t('tabs.successful-uploads')}
          </Tab>
        )}
        {failedUploads.length > 0 && (
          <Tab
            key={DecryptedIdDocStatus.fail}
            onClick={() => setTab(DecryptedIdDocStatus.fail)}
            selected={tab === DecryptedIdDocStatus.fail}
          >
            {t('tabs.failed-uploads')}
          </Tab>
        )}
      </Tabs>
      <ImagesPreview
        images={
          tab === DecryptedIdDocStatus.success
            ? successfulUploads
            : failedUploads
        }
      />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[5]};
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[6]};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[6]};

    nav {
      width: 100%;
      align-self: flex-start;
    }
  `};
`;

export default DecryptedDataPreview;
