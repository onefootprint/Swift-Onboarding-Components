import { IcoInfo16, IcoPencil16 } from '@onefootprint/icons';
import { LinkButton, Text, Tooltip } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DataToCollectMeta } from 'src/pages/playbooks/utils/machine/types';
import { PlaybookKind } from 'src/pages/playbooks/utils/machine/types';
import styled, { css } from 'styled-components';

type PreviewHeaderProps = {
  meta: DataToCollectMeta;
  canEdit: boolean;
  onStartEditing: () => void;
};

const PreviewHeader = ({ meta, canEdit, onStartEditing }: PreviewHeaderProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.person',
  });

  return (
    <Header>
      {meta.kind === PlaybookKind.Kyb ? (
        <TitleContainer>
          <Text variant="label-3">{t('title.kyb.main')}</Text>
          <Tooltip alignment="center" position="right" text={t('title.kyb.tooltip')}>
            <IcoInfo16 testID="info-tooltip" />
          </Tooltip>
        </TitleContainer>
      ) : (
        <Text variant="label-3">{t('title.kyc')}</Text>
      )}
      {canEdit && (
        <LinkButton iconComponent={IcoPencil16} iconPosition="left" onClick={onStartEditing} variant="label-4">
          {t('edit')}
        </LinkButton>
      )}
    </Header>
  );
};

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: ${theme.spacing[2]};
  `}
`;

export default PreviewHeader;
