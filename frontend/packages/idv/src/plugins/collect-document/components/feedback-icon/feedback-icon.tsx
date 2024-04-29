import type { Color } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';
import React from 'react';
import styled, { css } from 'styled-components';

type FeedbackIconProps = {
  imageIcon: {
    component: Icon;
    color?: Color;
  };
  statusIndicator: {
    component: JSX.Element;
    status: 'loading' | 'error' | 'success';
    backgroundColor?: 'primary' | 'secondary';
  };
};

const FeedbackIcon = ({
  imageIcon: { component: ImageIcon, color: imageIconColor },
  statusIndicator: {
    component: statusIndicatorComponent,
    status,
    backgroundColor = 'primary',
  },
}: FeedbackIconProps) => (
  <IconComponent>
    <ImageIcon color={imageIconColor} />
    <StatusContainer data-status={status} backgroundColor={backgroundColor}>
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

const StatusContainer = styled.div<{
  backgroundColor: 'primary' | 'secondary';
}>`
  ${({ theme, backgroundColor }) => css`
    position: absolute;
    display: flex;
    justify-content: center;
    right: calc(-1 * ${theme.spacing[6]});
    bottom: calc(-1 * ${theme.spacing[4]} - ${theme.spacing[1]});
    border-width: ${theme.spacing[2]};
    border-style: solid;
    border-color: ${theme.backgroundColor[backgroundColor]};
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
