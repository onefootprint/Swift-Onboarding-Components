'use client';

import { IcoClose24 } from '@onefootprint/icons';
import { Button, IconButton, Stack, Text, useToast } from '@onefootprint/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { revalidatePathAction } from '@/app/actions';
import { alertError } from '@/helpers';
import { type CreateReviewRequest, postPartnerPartnershipsDocumentsReviews } from '@/queries';

import DialogReviewDocument from '../../../../app/components/dialog-review-document';

type HeaderProps = {
  children: React.ReactNode;
  documentId: string;
  documentStatus?: string;
  iframeId: string;
  kind: 'external_url' | 'file_upload';
  partnerId: string;
  submissionId: string;
};

const downloadPdfFromIframe = (id: string) => {
  const iframe = document.getElementById(id) as null | HTMLIFrameElement;
  if (!iframe) {
    console.error('Iframe element not found');
    return;
  }

  const a = document.createElement('a');
  a.setAttribute('download', 'document');
  a.setAttribute('href', iframe.src);
  a.setAttribute('target', '_blank');
  a.click();
};

const Header = ({ children, documentId, documentStatus, iframeId, kind, partnerId, submissionId }: HeaderProps) => {
  const router = useRouter();
  const params = useSearchParams();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const { t } = useTranslation('common');
  const toast = useToast();
  const errorToast = alertError(t, toast.show);

  const path = params.get('path');
  const onCloseClick = path ? () => router.push(path) : () => router.back();

  const docReview = useCallback(
    (payload: CreateReviewRequest) =>
      postPartnerPartnershipsDocumentsReviews(partnerId, documentId, payload)
        .then(() => {
          revalidatePathAction(`/app/companies/${partnerId}/`);
          const docsPath = `/app/companies/${partnerId}?rdecision=${payload.decision}`;
          router.push(docsPath);
        })
        .catch(errorToast),
    [partnerId, documentId], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isReviewDialogOpen) {
        onCloseClick();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isReviewDialogOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container>
      <Stack alignItems="center" justifyContent="space-between" paddingBlock={3} paddingInline={5}>
        <Left>
          <IconButton aria-label="close" onClick={onCloseClick}>
            <IcoClose24 />
          </IconButton>
        </Left>
        <Text variant="label-3">{children}</Text>
        <StackRight alignItems="center" justifyContent="space-between" gap={3}>
          {kind === 'file_upload' ? (
            <Button variant="secondary" onClick={() => downloadPdfFromIframe(iframeId)}>
              {t('download')}
            </Button>
          ) : null}
          {documentStatus === 'waiting_for_review' ? (
            <Button variant="primary" onClick={() => setIsReviewDialogOpen(true)}>
              {t('review')}
            </Button>
          ) : null}
        </StackRight>
      </Stack>
      <DialogReviewDocument
        isOpen={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        onSubmit={({ decision, note }) => {
          docReview({ decision, note, submissionId });
          setIsReviewDialogOpen(false);
        }}
        options={[
          { label: t('accepted'), value: 'accepted' },
          { label: t('rejected'), value: 'rejected' },
        ]}
      />
    </Container>
  );
};

const Left = styled.div`
  flex-basis: 25%;
  justify-content: left;
`;

const StackRight = styled(Stack)`
  flex-basis: 25%;
  justify-content: flex-end;
`;

const Container = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
  `}
`;

export default Header;
