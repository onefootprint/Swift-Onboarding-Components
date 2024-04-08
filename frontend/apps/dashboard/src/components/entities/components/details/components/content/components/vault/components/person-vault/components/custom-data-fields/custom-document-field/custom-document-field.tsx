import type { Entity } from '@onefootprint/types';
import { CodeInline, Dialog, LinkButton } from '@onefootprint/ui';
import Image from 'next/image';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useField from '../../../../../hooks/use-field';
import type { DiField } from '../../../../../vault.types';
import getMimeType from '../../../utils/get-mime-type';

type CustomDocumentFieldProps = {
  field: DiField;
  entity: Entity;
};

const CustomDocumentField = ({ field, entity }: CustomDocumentFieldProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.fieldset.custom',
  });
  const [isDocOpen, setIsDocOpen] = useState(false);
  const { value } = useField(entity)(field.di);
  const srcString = typeof value === 'string' ? value : '';
  const mimeType = getMimeType(srcString);
  const isPDF = mimeType === 'application/pdf';
  const base64Src = mimeType ? `data:${mimeType};base64,${srcString}` : '';

  return (
    <Container>
      <CodeInline disabled>{field.di}</CodeInline>
      <LinkButton onClick={() => setIsDocOpen(true)}>
        {t('see-document')}
      </LinkButton>
      <Dialog
        open={isDocOpen}
        onClose={() => setIsDocOpen(false)}
        title={field.di}
        size={isPDF ? 'full-screen' : 'default'}
      >
        {isPDF ? (
          <PdfContainer>
            <iframe title="pdf" src={base64Src} width="100%" height="100%" />
          </PdfContainer>
        ) : (
          <StyledImage
            src={base64Src}
            width={0}
            height={0}
            alt="custom document image"
          />
        )}
      </Dialog>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
  align-items: center;
`;

const StyledImage = styled(Image)`
  position: relative;
  width: 100%;
  height: 100%;
`;

const PdfContainer = styled.div`
  ${({ theme }) => css`
    width: 100vw;
    height: calc(100vh - 48px);
    margin: calc(-1 * ${theme.spacing[7]});
    margin-bottom: calc(-1 * ${theme.spacing[5]});
  `};
`;

export default CustomDocumentField;
