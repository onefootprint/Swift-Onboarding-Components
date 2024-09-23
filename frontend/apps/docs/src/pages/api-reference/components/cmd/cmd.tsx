import { Command } from '@onefootprint/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { scroller } from 'react-scroll';

import type { ContentSchemaNoRef } from '../../api-reference.types';
import { ARTICLES_CONTAINER_ID } from '../articles';
import type { PageNavProps } from '../nav/nav.types';
import Footer from './components/footer/footer';
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
  const [discoverOpen, setDiscoverOpen] = useState(true);
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
      <Command.Discover open={discoverOpen} onClose={() => setDiscoverOpen(false)}>
        {t('jump-to-section')} (⌘ + K) `
      </Command.Discover>
      <Command.Container open={open} onOpenChange={setOpen}>
        <Command.Input value={search} onValueChange={setSearch} onErase={resetSearch} />
        <Command.List>
          <Command.Empty>{t('no-results')}</Command.Empty>
          {sections.map(({ title: parentTitle, id, subsections }) => (
            // TODO headers have corresponding content in the new API reference site, but they aren't selectable here
            <Command.Group heading={parentTitle} key={id}>
              {subsections.map(({ title, id, api }) => (
                <Command.Item
                  onSelect={() => handleScroll(id)}
                  key={id}
                  keywords={api ? [api.method, api.path] : undefined}
                >
                  <ScrollOption title={title} parentTitle={parentTitle} />
                </Command.Item>
              ))}
            </Command.Group>
          ))}
          <Command.Group heading="Requests">
            {allSubsections.map(({ api, title, id }) =>
              extractSchemaProperties(api?.requestBody?.content).map(propertyName => (
                <Command.Item onSelect={() => handleScroll(id)} key={`request-${id}-${propertyName}`}>
                  <ScrollOption title={propertyName} parentTitle={`${title} request`} />
                </Command.Item>
              )),
            )}
          </Command.Group>
          <Command.Group heading="Responses">
            {allSubsections.map(({ api, title, id }) =>
              Object.values(api?.responses || {})
                .flatMap(response => extractSchemaProperties(response.content))
                .map(propertyName => (
                  <Command.Item onSelect={() => handleScroll(id)} key={`response-${id}-${propertyName}`}>
                    <ScrollOption title={propertyName} parentTitle={`${title} response`} />
                  </Command.Item>
                )),
            )}
          </Command.Group>
          <Command.Group heading="Parameters">
            {allSubsections.map(({ api, title, id }) =>
              (api?.parameters || [])
                .filter(parameter => !IGNORE_PARAMETERS.includes(parameter.name))
                .filter(parameter => parameter.in !== 'path')
                .map(parameter => (
                  <Command.Item onSelect={() => handleScroll(id)} key={`param-${id}-${parameter.name}`}>
                    <ScrollOption title={parameter.name} parentTitle={title} />
                  </Command.Item>
                )),
            )}
          </Command.Group>
        </Command.List>
        <Footer />
      </Command.Container>
    </>
  );
};

export default Cmd;
