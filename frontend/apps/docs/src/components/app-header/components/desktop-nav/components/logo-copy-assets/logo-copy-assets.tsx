import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IcoDownload16, LogoFpCompact } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Dropdown, Typography } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { MouseEvent, useState } from 'react';

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
  const { t } = useTranslation('components.save-assets');
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
        <Trigger
          onClick={handleButtonClick}
          onContextMenu={handleButtonContextMenu}
        >
          <LogoFpCompact />
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
            <Typography variant="body-2"> {t(asset.label)} </Typography>
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
    background-color: ${theme.backgroundColor.primary};

    &:hover {
      && {
        background: ${theme.backgroundColor.primary};
      }
    }

    &[data-state='open'] {
      && {
        background: ${theme.backgroundColor.primary};
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
