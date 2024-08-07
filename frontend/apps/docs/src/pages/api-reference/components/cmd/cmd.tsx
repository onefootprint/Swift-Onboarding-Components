import { IcoClose16, IcoSearch24 } from '@onefootprint/icons';
import { Grid, IconButton, Overlay, Stack, Text, createFontStyles } from '@onefootprint/ui';
import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { PageNavProps } from '../nav/nav.types';
import TypeBadge from '../type-badge';
import Footer from './components/footer/footer';
import Keycaps from './components/keycaps/keycaps';

const Cmd = ({ sections }: PageNavProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.cmd' });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const resetSearch = () => {
    setSearch('');
  };

  const handleKeyDown = (e: {
    key: string;
    metaKey: boolean;
    ctrlKey: boolean;
    preventDefault: () => void;
  }) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen(currentOpen => !currentOpen);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => setOpen(false), 1000);
  };

  return (
    <>
      <DialogContainer open={open} onOpenChange={setOpen} label={t('title')}>
        <InputContainer>
          <IcoSearch24 color="tertiary" />
          <SearchInput value={search} onValueChange={setSearch} />
          <IconButton aria-label={t('remove-content')} onClick={resetSearch}>
            <IcoClose16 color="tertiary" />
          </IconButton>
        </InputContainer>
        <List>
          <EmptyState>{t('no-results')}</EmptyState>
          {sections &&
            sections.map(({ title, isPreview, subsections }) => (
              <Group heading={title} key={title} data-preview={isPreview}>
                {subsections
                  .flatMap(s => s.apiArticles)
                  .map(({ id, method, path }) => (
                    <Option key={id} onSelect={() => handleScroll(id)}>
                      <Grid.Container columns={['56px', '1fr']}>
                        <Grid.Item justify="start">
                          <TypeBadge skinny type={method} />
                        </Grid.Item>
                        <Grid.Item>{path}</Grid.Item>
                      </Grid.Container>
                    </Option>
                  ))}
              </Group>
            ))}
          <Group>
            {sections.flatMap(({ subsections }) =>
              subsections
                .flatMap(s => s.apiArticles)
                .flatMap(({ parameters = [], id }) =>
                  parameters.map(parameter => (
                    <Option onSelect={() => handleScroll(id)} key={id}>
                      <Stack direction="row" gap={3}>
                        <Text variant="label-2">{parameter.name}</Text>
                        <Text variant="body-2" color="tertiary">
                          {id}
                        </Text>
                      </Stack>
                    </Option>
                  )),
                ),
            )}
          </Group>
        </List>
        <Footer />
      </DialogContainer>
      <Overlay isVisible={open} />
      <Keycaps />
    </>
  );
};

const Group = styled(Command.Group)`
  ${({ theme }) => css`
    padding: ${theme.spacing[1]} 0;
    [cmdk-group-heading] {
      ${createFontStyles('label-3')}
      color: ${theme.color.primary};
      padding-bottom: ${theme.spacing[2]};
      margin-top: ${theme.spacing[3]};
      opacity: 70%;
    }
  `}
`;

const Option = styled(Command.Item)`
  ${({ theme }) => css`
    ${createFontStyles('body-2')}
    cursor: pointer;
    color: ${theme.color.primary};
    padding: ${theme.spacing[4]} 0 ${theme.spacing[4]} ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.default};
    transition: background-color 0.2s ease-in-out;

    a {
      all: unset;
    }

    &[data-selected='true'] {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

const DialogContainer = styled(Command.Dialog)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    z-index: ${theme.zIndex.dialog};
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[3]};
    border-radius: ${theme.borderRadius.default};
    width: 640px;
    overflow: hidden;
  `};
`;

const InputContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    gap: ${theme.spacing[4]};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const SearchInput = styled(Command.Input)`
  ${({ theme }) => css`
    all: unset;
    ${createFontStyles('body-3')}
    color: ${theme.color.tertiary};
    flex: 1;
  `}
`;

const List = styled(Command.List)`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]};
    max-height: 480px;
    overflow-y: auto;
  `}
`;

const EmptyState = styled(Command.Empty)`
  ${({ theme }) => css`
    ${createFontStyles('body-2')}
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: ${theme.color.tertiary};
    padding: ${theme.spacing[5]};
    text-align: center;
  `}
`;

export default Cmd;
