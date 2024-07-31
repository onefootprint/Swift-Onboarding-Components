import { IcoInfo16, IcoPencil16 } from '@onefootprint/icons';
import { LinkButton, Stack, Text, Tooltip } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlaybookKind } from 'src/pages/playbooks/utils/machine/types';
import styled, { css } from 'styled-components';

type HeaderProps = {
  canEdit: boolean;
  onStartEditing: () => void;
};

const Header = ({ canEdit, onStartEditing }: HeaderProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.settings-person.preview',
  });

  return (
    <Stack justifyContent="space-between">
      <Text variant="label-3">{t('title')}</Text>
      {canEdit && (
        <LinkButton iconComponent={IcoPencil16} iconPosition="left" onClick={onStartEditing} variant="label-4">
          {t('edit')}
        </LinkButton>
      )}
    </Stack>
  );
};

export default Header;
