'use client';

import { IcoClose24 } from '@onefootprint/icons';
import { Button, IconButton, Stack, Text } from '@onefootprint/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type CreateReviewRequest,
  postPartnerPartnershipsDocumentsReviews,
} from '@/queries';

import DialogReviewDocument from '../../../../app/components/dialog-review-document';

type HeaderProps = {
  children: React.ReactNode;
  documentId: string;
  documentStatus?: string;
  iframeId: string;
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

const Header = ({
  children,
  documentId,
  documentStatus,
  iframeId,
  partnerId,
  submissionId,
}: HeaderProps) => {
  const router = useRouter();
  const params = useSearchParams();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const { t } = useTranslation('common');

  const path = params.get('path');
  const onCloseClick = path ? () => router.push(path) : () => router.back();

  const docReview = useCallback(
    (payload: CreateReviewRequest) =>
      postPartnerPartnershipsDocumentsReviews(
        partnerId,
        documentId,
        payload,
      ).then(onCloseClick),
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
    <>
      <Stack
        alignItems="center"
        justifyContent="space-between"
        paddingBlock={3}
        paddingInline={5}
      >
        <IconButton aria-label="close" onClick={onCloseClick}>
          <IcoClose24 />
        </IconButton>
        <Text variant="label-3">{children}</Text>
        <Stack alignItems="center" justifyContent="space-between" gap={3}>
          <Button
            variant="secondary"
            onClick={() => downloadPdfFromIframe(iframeId)}
          >
            {t('download')}
          </Button>
          {documentStatus === 'waiting_for_review' ? (
            <Button
              variant="primary"
              onClick={() => setIsReviewDialogOpen(true)}
            >
              {t('review')}
            </Button>
          ) : null}
        </Stack>
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
    </>
  );
};

export default Header;
