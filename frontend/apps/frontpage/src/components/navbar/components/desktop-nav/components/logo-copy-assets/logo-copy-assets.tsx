import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoDownload16, ThemedLogoFpCompact } from '@onefootprint/icons';
import { Dropdown, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useRouter } from 'next/router';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const assetsToCopy = [
  { label: 'isotype', imgSrc: '/footprint-logos/isotype.svg' },
  { label: 'logo', imgSrc: '/footprint-logos/logo.svg' },
];

const LogoCopyAssets = ({ href = FRONTPAGE_BASE_URL }) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.navbar.save-assets' });
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);

  const handleClick = () => router.push(href);

  const handleContextMenu = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowOptions(true);
  };

  const downloadFile = (label: string) => {
    const asset = assetsToCopy.find(a => a.label === label);
    if (asset) {
      const link = document.createElement('a');
      link.href = asset.imgSrc;
      link.download = `${label}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSave = (label: string) => () => {
    downloadFile(label);
    setShowOptions(false);
  };

  return (
    <Dropdown.Root open={showOptions}>
      <Dropdown.Trigger aria-label={t('aria-label')} asChild>
        <Trigger onClick={handleClick} onContextMenu={handleContextMenu}>
          <ThemedLogoFpCompact color="primary" />
        </Trigger>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align="start"
          sideOffset={-8}
          onEscapeKeyDown={() => setShowOptions(false)}
          onPointerDownOutside={() => setShowOptions(false)}
        >
          <Dropdown.Group>
            {assetsToCopy.map(({ label }) => (
              <Dropdown.Item key={label} onClick={handleSave(label)}>
                <Stack direction="row" align="center" justify="flex-start" gap={3}>
                  <Stack align="center" justify="center" paddingBottom={1}>
                    <IcoDownload16 />
                  </Stack>
                  <Text variant="body-2">{t(label as ParseKeys<'common'>)}</Text>
                </Stack>
              </Dropdown.Item>
            ))}
          </Dropdown.Group>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};

const Trigger = styled.button`
  ${({ theme }) => css`
    all: unset;
    display: flex;
    align-items: center;
    min-width: fit-content;
    height: 100%;
    margin-right: ${theme.spacing[3]};

    &&,
    &&:hover {
      background-color: ${theme.backgroundColor.transparent};
    }
  `}
`;

export default LogoCopyAssets;
