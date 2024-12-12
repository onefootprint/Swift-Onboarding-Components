import { Button, Pagination, Stack, Text } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { Suspense, lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import styled, { css } from 'styled-components';

import Table from './components/table';
import useFilters from './hooks/use-filters';
import usePlaybooks from './hooks/use-playbooks';

const Create = lazy(() => import('../../components/playbooks/create-playbook'));

const Playbooks = () => {
  const { t } = useTranslation('playbooks');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasHadPlaybook, setHasHadPlaybook] = useState(false);
  const { data: response, errorMessage, isPending, pagination } = usePlaybooks();
  const filters = useFilters();

  const handleOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleCreate = () => {
    setDialogOpen(false);
    filters.clear();
  };

  useEffect(() => {
    if (response && response?.data?.length > 0) {
      setHasHadPlaybook(true);
    }
  }, [response]);

  const highlighterAnimation = {
    initial: { opacity: 0.2 },
    animate: {
      opacity: 0,
      transform: 'scale(2.5)',
      transition: { duration: 5, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY },
      borderRadius: '10px',
    },
  };

  return (
    <Stack flexDirection="column" gap={8}>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
        <Stack flexDirection="column" gap={2} maxWidth="650px">
          <Text variant="heading-2">{t('header.title')}</Text>
          <Text variant="body-2" color="secondary">
            {t('header.subtitle')}
          </Text>
        </Stack>
        <Wrapper>
          <Stack position="relative">
            {!hasHadPlaybook && <Highlighter variants={highlighterAnimation} initial="initial" animate="animate" />}
            <PermissionGate scopeKind="onboarding_configuration" fallbackText={t('cta-not-allowed')}>
              <Button onClick={handleOpen}>{t('create-button')}</Button>
            </PermissionGate>
          </Stack>
        </Wrapper>
      </Stack>
      <Stack direction="column">
        <Table data={response?.data} errorMessage={errorMessage} isPending={isPending} />
        {response && response.meta.count > 0 && (
          <Pagination
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            onNextPage={pagination.loadNextPage}
            onPrevPage={pagination.loadPrevPage}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            totalNumResults={response.meta.count}
          />
        )}
      </Stack>
      <Suspense fallback={null}>
        <Create open={dialogOpen} onClose={handleClose} onDone={handleCreate} />
      </Suspense>
    </Stack>
  );
};

const Highlighter = styled(motion.span)<{ shouldHighlight?: boolean }>`
  ${({ theme }) => css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    isolation: isolate;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${theme.backgroundColor.accent};
    border-radius: ${theme.borderRadius.default};
  `}
`;

const Wrapper = styled.div`
  position: relative;
`;

export default Playbooks;
