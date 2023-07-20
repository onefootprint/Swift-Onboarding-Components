import { useToggle, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { EntityVault, SupportedIdDocTypes } from '@onefootprint/types';
import { Drawer, LinkButton, Typography } from '@onefootprint/ui';
import React, { Fragment } from 'react';

export type DocumentFieldProps = {
  label: string;
  vault: EntityVault;
  documentKind?: SupportedIdDocTypes;
};

const DocumentField = ({ label, documentKind, vault }: DocumentFieldProps) => {
  const { t } = useTranslation('pages.entity.fieldset.document');
  const [isDrawerOpen, show, hide] = useToggle(false);

  return documentKind ? (
    <Container role="row" aria-label={label}>
      <>
        <Inner>
          <LabelContainer>
            <Typography variant="body-3" color="tertiary" as="label">
              {label}
            </Typography>
          </LabelContainer>
          {isDrawerOpen ? (
            <LinkButton onClick={hide}>{t('hide')}</LinkButton>
          ) : (
            <LinkButton onClick={show}>{t('show')}</LinkButton>
          )}
        </Inner>
        <Drawer
          closeAriaLabel="drawer-close-button"
          open={isDrawerOpen}
          title={t(`drawer.${documentKind}.title`)}
          onClose={hide}
        >
          {/* Placeholder! */}
          <div>{JSON.stringify(vault)}</div>
          <DrawerItems />
        </Drawer>
      </>
    </Container>
  ) : null;
};
const Container = styled.div``;

const Inner = styled.div`
  display: flex;
  flex-direction: column wrap;
  justify-content: space-between;
`;

const DrawerItems = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

const LabelContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: row;
    align-items: flex-end;
  `};
`;

export default DocumentField;
