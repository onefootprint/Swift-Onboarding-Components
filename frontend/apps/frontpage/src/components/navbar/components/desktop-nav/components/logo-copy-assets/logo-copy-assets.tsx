import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoDownload16, ThemedLogoFpCompact } from '@onefootprint/icons';
import { Dropdown, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useRouter } from 'next/router';
import type { MouseEvent } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const assetsToCopy = [
  {
    label: 'isotype',
    imgSrc: '/footprint-logos/isotype.svg',
  },
  {
    label: 'logo',
    imgSrc: '/footprint-logos/logo.svg',
  },
];

type LogoCopyAssetsProps = {
  href?: string;
};

const LogoCopyAssets = ({ href = FRONTPAGE_BASE_URL }: LogoCopyAssetsProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.navbar.save-assets',
  });
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);

  const handleButtonClick = () => {
    router.push(href);
  };

  const handleButtonContextMenu = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowOptions(true);
  };

  const getImgSrc = (label: string) => {
    const element = assetsToCopy.find(asset => asset.label === label);
    return element?.imgSrc;
  };

  const downloadFile = (label: string) => {
    const imgSrc = getImgSrc(label);
    const link = document.createElement('a');
    if (imgSrc) {
      link.href = imgSrc;
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
        <Trigger onClick={handleButtonClick} onContextMenu={handleButtonContextMenu}>
          <ThemedLogoFpCompact color="primary" />
        </Trigger>
      </Dropdown.Trigger>
      <Dropdown.Content
        align="start"
        sideOffset={8}
        onEscapeKeyDown={() => setShowOptions(false)}
        onPointerDownOutside={() => setShowOptions(false)}
      >
        {assetsToCopy.map(asset => (
          <StyledItem key={asset.label} onClick={handleSave(asset.label)}>
            <IcoDownload16 color="tertiary" />
            <Text variant="body-2"> {t(asset.label as ParseKeys<'common'>)} </Text>
          </StyledItem>
        ))}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

const Trigger = styled.button`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    min-width: fit-content;
    height: 100%;
    background-color: ${theme.backgroundColor.transparent};
    margin-right: ${theme.spacing[3]};

    &:hover {
      && {
        background: ${theme.backgroundColor.transparent};
      }
    }

    &[data-state='open'] {
      && {
        background: ${theme.backgroundColor.transparent};
      }
    }

    & {
      svg {
        transform: scale(0.95);
        margin-bottom: 3px;
        path {
           {
            fill: ${theme.color.primary};
          }
        }
      }
    }
  `}
`;

const StyledItem = styled(Dropdown.Item)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
  `}
`;

export default LogoCopyAssets;
