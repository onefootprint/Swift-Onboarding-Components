import { Color } from '@onefootprint/design-tokens';
import { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React from 'react';

type FeedbackIconProps = {
  imageIcon: {
    component: Icon;
    color?: Color;
  };
  statusIndicator: {
    component: JSX.Element;
    status: 'loading' | 'error' | 'success';
  };
};

const FeedbackIcon = ({
  imageIcon: { component: ImageIcon, color: imageIconColor },
  statusIndicator: { component: statusIndicatorComponent, status },
}: FeedbackIconProps) => (
  <IconComponent>
    <ImageIcon color={imageIconColor} />
    <StatusContainer data-status={status}>
      {statusIndicatorComponent}
    </StatusContainer>
  </IconComponent>
);

const IconComponent = styled.div`
  ${({ theme }) => css`
    position: relative;
    width: ${theme.spacing[9]};
    height: ${theme.spacing[9]};
    padding: ${theme.spacing[2]};
  `}
`;

const StatusContainer = styled.div`
  ${({ theme }) => css`
    position: absolute;
    display: flex;
    justify-content: center;
    right: calc(-1 * ${theme.spacing[6]});
    bottom: calc(-1 * ${theme.spacing[4]} - ${theme.spacing[1]});
    border: ${theme.spacing[2]} solid ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.full};
    padding: ${theme.spacing[2]};

    &[data-status='loading'] {
      background-color: ${theme.backgroundColor.warning};
    }
    &[data-status='error'] {
      background-color: ${theme.backgroundColor.error};
    }
    &[data-status='success'] {
      background-color: ${theme.backgroundColor.success};
    }
  `}
`;

export default FeedbackIcon;
