import { primitives } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React from 'react';

type SectionIconProps = {
  icon?: Icon;
  isOnDarkSection?: boolean;
};

const SectionIcon = ({ icon: Icon, isOnDarkSection }: SectionIconProps) => {
  const renderedIcon = Icon && <Icon color="accent" />;
  return (
    <Container isOnDarkSection={isOnDarkSection}>
      <IconOutline isOnDarkSection={isOnDarkSection}>
        {renderedIcon}
      </IconOutline>
    </Container>
  );
};

const Container = styled.div<{ isOnDarkSection?: boolean }>`
  ${({ theme, isOnDarkSection }) => css`
    width: 48px;
    height: 48px;
    background-color: ${
      isOnDarkSection ? primitives.Gray800 : theme.backgroundColor.secondary
    };
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    && {
      svg {
        path {
           {
            fill: ${isOnDarkSection && primitives.Purple300};
          }
        }
      }
    }
  `}
`;

const IconOutline = styled.div<{ isOnDarkSection?: boolean }>`
  ${({ theme, isOnDarkSection }) => css`
    border: 1.5px solid
      ${isOnDarkSection ? primitives.Purple300 : theme.borderColor.secondary};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
  `}
`;

export default SectionIcon;
