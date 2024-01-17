import { primitives } from '@onefootprint/design-tokens';
import { useTranslation } from '@onefootprint/hooks';
import {
  IcoCheckSmall16,
  IcoPlusSmall16,
  IcoTrash16,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Button, createFontStyles, Stack, Typography } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { useHover } from 'usehooks-ts';

type OptionProps = {
  children: string;
  value: string;
  onClick?: (body: string, value?: string) => void;
  onDelete?: (value: string) => void;
  isEdit?: boolean;
};

const Option = ({
  children,
  value,
  onClick,
  onDelete,
  isEdit,
}: OptionProps) => {
  const { t } = useTranslation('components.frequent-notes');
  const hoverRef = useRef<HTMLDivElement>(null);
  const isHovered = useHover(hoverRef);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [hideCheckTimeout, setHideCheckTimeout] = useState<NodeJS.Timeout>();

  const handleOnClick = () => {
    if (isEdit) {
      setShowConfirmation(!showConfirmation);
    } else if (onClick) {
      onClick(children, value);
      setIsCopied(true);

      if (hideCheckTimeout) {
        clearTimeout(hideCheckTimeout);
      }
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 1000);
      setHideCheckTimeout(timeout);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(value);
    }
  };

  const renderIcon = () => {
    if (isEdit) {
      return <IcoTrash16 color="tertiary" />;
    }
    if (isCopied) {
      return <IcoCheckSmall16 color="primary" />;
    }
    if (isHovered) {
      return <IcoPlusSmall16 color="primary" />;
    }
    return <IcoPlusSmall16 color="tertiary" />;
  };

  return (
    <Container
      ref={hoverRef}
      $isHovered={isHovered}
      $isCopied={isCopied}
      onClick={handleOnClick}
    >
      <Stack direction="row" gap={3} padding={4} align="start">
        <IconContainer
          isHovered={isHovered}
          isEdit={isEdit}
          align="start"
          justify="center"
          borderRadius="full"
          padding={2}
          flexGrow={0}
        >
          {renderIcon()}
        </IconContainer>
        <TextContainer
          padding={2}
          align="start"
          justify="start"
          color={isHovered ? 'primary' : 'secondary'}
        >
          <p>{children}</p>
        </TextContainer>
      </Stack>
      {showConfirmation && (
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.1 }}
        >
          <ConfirmationFooter>
            <Typography variant="body-4" color="tertiary">
              {t('warning')}
            </Typography>
            <Button size="small" onClick={handleDelete}>
              {t('delete')}
            </Button>
          </ConfirmationFooter>
        </motion.span>
      )}
    </Container>
  );
};

const Container = styled(motion.div)<{
  $isHovered?: boolean;
  $isCopied?: boolean;
}>`
  ${({ theme, $isHovered: isHovered, $isCopied: isCopied }) => css`
    all: unset;
    ${createFontStyles('body-3')}
    cursor: pointer;
    display: flex;
    flex-direction: column;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    transition: all 0.2s ease-in-out;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    max-width: 100%;

    ${isHovered &&
    !isCopied &&
    css`
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    `}
  `};
`;

const IconContainer = styled(Stack)<{
  isHovered?: boolean;
  isEdit?: boolean;
}>`
  ${({ theme, isHovered, isEdit }) => css`
    height: 100%;
    width: fit-content;
    transition: all 0.2s ease-in-out;
    margin-top: ${theme.spacing[2]};
    background-color: ${theme.backgroundColor.secondary};

    ${isEdit &&
    !isHovered &&
    css`
      background-color: ${theme.backgroundColor.secondary};
    `}

    ${isHovered &&
    !isEdit &&
    css`
      background-color: ${theme.backgroundColor.senary};
    `}

    ${isHovered &&
    isEdit &&
    css`
      background-color: ${theme.backgroundColor.error};
      svg {
        path {
          fill: ${theme.color.error};
        }
      }
    `}
  `};
`;

const TextContainer = styled(Stack)`
  ${({ theme }) => css`
    max-height: ${theme.spacing[11]};
    max-width: 100%;

    p {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `};
`;

const ConfirmationFooter = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[4]};
    padding-left: ${theme.spacing[5]};
    justify-content: space-between;
    align-items: center;
    border-top: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};

    button {
      background-color: ${theme.color.error};

      &:hover:enabled {
        background-color: ${primitives.Red700};
      }
    }
  `};
`;

export default Option;
