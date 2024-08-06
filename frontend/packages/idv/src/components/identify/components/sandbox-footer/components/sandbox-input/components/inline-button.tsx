import type { Icon } from '@onefootprint/icons';
import { Tooltip } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type InlineButtonProps = {
  icon?: Icon;
  tooltipText?: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

const InlineButton = ({ icon: Icon, tooltipText, onClick, disabled, ariaLabel }: InlineButtonProps) => {
  const icon = Icon && <Icon color={disabled ? 'quaternary' : 'primary'} />;

  return onClick ? (
    <Tooltip text={tooltipText} disabled={disabled}>
      <Container
        role="button"
        onClick={onClick}
        aria-label={ariaLabel}
        data-disabled={disabled}
        aria-disabled={disabled}
      >
        {icon}
      </Container>
    </Tooltip>
  ) : (
    <Container>{icon}</Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    position: relative;
    border-radius: ${theme.borderRadius.default};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${theme.spacing[9]};
    width: ${theme.spacing[9]};

    svg {
      z-index: 1;
    }

    @media (hover: hover) {
      &:hover {
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: ${theme.borderRadius.default};
          height: ${theme.spacing[8]};
          width: ${theme.spacing[8]};
          background-color: ${theme.backgroundColor.secondary};
          z-index: 0;
        }
      }
    }

    &:active {
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: ${theme.borderRadius.default};
        height: ${theme.spacing[8]};
        width: ${theme.spacing[8]};
        background-color: ${theme.backgroundColor.senary};
        z-index: 0;
      }
    }

    &[data-disabled='true'] {
      pointer-events: none;
    }
  `}
`;

export default InlineButton;
