import { Command } from 'cmdk';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { createFontStyles } from '../../../../utils';

type ComboListProps = {
  emptyText: string;
  children: React.ReactNode;
};

const ComboList = ({ emptyText, children }: ComboListProps) => {
  const { t } = useTranslation('ui', { keyPrefix: 'components.combo' });
  return (
    <Container>
      <Empty>{emptyText || t('empty-state-default')}</Empty>
      {children}
    </Container>
  );
};

const Container = styled(Command.List)`
  ${({ theme }) => css`
    scroll-padding-block-start: ${theme.spacing[3]};
    scroll-padding-block-end: ${theme.spacing[3]};
    height: var(--cmdk-list-height);
    transition: height 100ms ease;
  `}
`;

const Empty = styled(Command.Empty)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.color.quaternary};
    height: 100%;
    padding: ${theme.spacing[4]};
  `}
`;

export default ComboList;
