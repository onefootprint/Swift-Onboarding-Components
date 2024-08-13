import { IcoClose16, IcoSearch24 } from '@onefootprint/icons';
import { IconButton, Overlay, createFontStyles } from '@onefootprint/ui';
import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { scroller } from 'react-scroll';
import styled, { css } from 'styled-components';

import { ContentSchemaNoRef } from '../../api-reference.types';
import { ARTICLES_CONTAINER_ID } from '../articles';
import type { PageNavProps } from '../nav/nav.types';
import Footer from './components/footer/footer';
import Keycaps from './components/keycaps/keycaps';
import ScrollOption from './components/scroll-option';

const IGNORE_PARAMETERS = ['fp_id', 'fp_bid', 'page', 'cursor', 'page_size'];

/** Given a request or response schema, extracts the interesting schema that we actually want to display. This unwraps responses that are either lists or paginated. */
const extractSchema = (schema?: ContentSchemaNoRef): ContentSchemaNoRef | undefined => {
  if (schema?.properties?.meta) {
    // This is a paginated response, return the nested schema
    return schema?.properties?.data?.items;
  }
  return schema?.properties?.items || schema;
};

const extractSchemaProperties = (schema?: ContentSchemaNoRef) => {
  return Object.keys(extractSchema(schema)?.properties || {}).filter(
    propertyName => propertyName !== '<key>' && propertyName !== '<value>',
  );
};

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
    // For some reason, need to set a timeout for keyboard events to work properly
    setTimeout(() => {
      setOpen(false);
      scroller.scrollTo(id, { smooth: true, duration: 500, containerId: ARTICLES_CONTAINER_ID, delay: 100 });
    }, 10);
  };

  const allSubsections = sections.flatMap(section => section.subsections).filter(({ api }) => !api?.isHidden);

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
          {sections.map(({ title: parentTitle, id, subsections }) => (
            // TODO headers have corresponding content in the new API reference site, but they aren't selectable here
            <Group heading={parentTitle} key={id}>
              {subsections.map(({ title, id, api }) => (
                <Option onSelect={() => handleScroll(id)} key={id} keywords={api ? [api.method, api.path] : undefined}>
                  <ScrollOption title={title} parentTitle={parentTitle} />
                </Option>
              ))}
            </Group>
          ))}
          <Group heading="Requests">
            {allSubsections.map(({ api, title, id }) =>
              extractSchemaProperties(api?.requestBody).map(propertyName => (
                <Option onSelect={() => handleScroll(id)} key={`request-${id}-${propertyName}`}>
                  <ScrollOption title={propertyName} parentTitle={`${title} request`} />
                </Option>
              )),
            )}
          </Group>
          <Group heading="Responses">
            {allSubsections.map(({ api, title, id }) =>
              Object.values(api?.responses || {})
                .flatMap(response => extractSchemaProperties(response))
                .map(propertyName => (
                  <Option onSelect={() => handleScroll(id)} key={`response-${id}-${propertyName}`}>
                    <ScrollOption title={propertyName} parentTitle={`${title} response`} />
                  </Option>
                )),
            )}
          </Group>
          <Group heading="Parameters">
            {allSubsections.map(({ api, title, id }) =>
              (api?.parameters || [])
                .filter(parameter => !IGNORE_PARAMETERS.includes(parameter.name))
                .filter(parameter => parameter.in !== 'path')
                .map(parameter => (
                  <Option onSelect={() => handleScroll(id)} key={`param-${id}-${parameter.name}`}>
                    <ScrollOption title={parameter.name} parentTitle={title} />
                  </Option>
                )),
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
