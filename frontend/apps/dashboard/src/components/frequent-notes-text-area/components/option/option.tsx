import { primitives } from '@onefootprint/design-tokens';
import { useTranslation } from '@onefootprint/hooks';
import {
  IcoCheckSmall16,
  IcoPlusSmall16,
  IcoTrash16,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Button, createFontStyles, Stack, Typography } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
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

      // The icon will flash to a check mark after it is copied, and then hide shortly after
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
      transition={{ duration: 0.2 }}
      layout
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
      <AnimatePresence>
        {showConfirmation && (
          <motion.span
            initial={{ opacity: 0, transform: 'translateY(-30%)' }}
            animate={{ opacity: 1, transform: 'translateY(0%)' }}
            exit={{ opacity: 0, transform: 'translateY(-10%)' }}
            transition={{ duration: 0.1 }}
          >
            <ConfirmationFooter>
              <Typography variant="body-4" color="secondary">
                {t('warning')}
              </Typography>
              <Button size="small" onClick={handleDelete}>
                {t('delete')}
              </Button>
            </ConfirmationFooter>
          </motion.span>
        )}
      </AnimatePresence>
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
    box-shadow: ${theme.elevation[1]};

    ${isHovered &&
    !isCopied &&
    css`
      box-shadow: ${theme.elevation[2]};
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
