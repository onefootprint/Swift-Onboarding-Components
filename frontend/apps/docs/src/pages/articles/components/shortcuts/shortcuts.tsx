import { Command } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PageNavigation } from 'src/types/page';
import Footer from './components/footer/footer';

type CmdProps = {
  navigation?: PageNavigation;
};

const Shortcuts = ({ navigation }: CmdProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.cmd' });
  const [open, setOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const resetSearch = () => {
    setSearch('');
  };

  const handleSelect = ({ slug }: { slug: string }) => {
    setOpen(false);
    resetSearch();
    router.push(slug);
  };

  return (
    <>
      <Command.Discover open={discoverOpen} onClose={() => setDiscoverOpen(false)}>
        {t('jump-to-section')} (⌘ + K) `
      </Command.Discover>
      <Command.Shortcut ctrlKey="k" onShortcut={() => setOpen(true)} onClose={() => setOpen(false)} />
      <Command.Container open={open} onOpenChange={setOpen}>
        <Command.Input value={search} onValueChange={setSearch} onErase={resetSearch} />
        <Command.List>
          <Command.Empty>{t('no-results')}</Command.Empty>
          {navigation?.map(section => (
            <Command.Group heading={section.name} key={section.name}>
              {section.items.map(item => (
                <Command.Item key={item.title} onSelect={() => handleSelect(item)}>
                  {item.title}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
        <Footer />
      </Command.Container>
    </>
  );
};

export default Shortcuts;
