import { useTranslation } from 'hooks';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
import { Box, EmptyState } from 'ui';

const UserDetailEmptyState = () => {
  const router = useRouter();
  const { t } = useTranslation('pages.user-details.empty-state');
  return (
    <Box sx={{ marginTop: 11 }}>
      <EmptyState
        renderImage={() => (
          <Image alt={t('image.cta')} height={212} src="/404.png" width={298} />
        )}
        title={t('title')}
        description={t('description')}
        cta={{
          label: t('cta'),
          onClick: () => router.push('/users'),
        }}
      />
    </Box>
  );
};

export default UserDetailEmptyState;
