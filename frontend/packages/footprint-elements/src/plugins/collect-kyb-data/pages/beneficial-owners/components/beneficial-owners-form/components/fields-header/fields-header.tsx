import { useTranslation } from '@onefootprint/hooks';
import { LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

type FieldsHeaderProps = {
  shouldShowRemove?: boolean;
  onRemove: () => void;
};

const FieldsHeader = ({ shouldShowRemove, onRemove }: FieldsHeaderProps) => {
  const { t } = useTranslation('pages.beneficial-owners.form.fields-header');

  return shouldShowRemove ? (
    <HeaderContainer>
      <Typography variant="label-2">{t('beneficial-owner-other')}</Typography>
      <LinkButton onClick={onRemove} size="compact">
        {t('remove')}
      </LinkButton>
    </HeaderContainer>
  ) : (
    <Typography variant="label-2">{t('beneficial-owner-you')}</Typography>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

export default FieldsHeader;
