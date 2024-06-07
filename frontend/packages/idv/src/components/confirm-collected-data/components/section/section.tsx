import type { Icon } from '@onefootprint/icons';
import { AnimatedLoadingSpinner, LinkButton, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type SectionAction = {
  label: string;
  onClick: () => void;
  isLoading?: boolean;
  actionTestID?: string;
};

export type SectionProps = {
  title: string;
  actions?: SectionAction[];
  IconComponent?: Icon;
  content: React.ReactNode;
  testID?: string;
};

const Section = ({ title, IconComponent, actions, content, testID }: SectionProps) => {
  const hasActions = actions && actions?.length > 0;

  return (
    <Container data-testid={testID}>
      <Header>
        <TitleContainer>
          {IconComponent && <IconComponent />}
          <Text marginLeft={IconComponent ? 2 : undefined} variant="label-2">
            {title}
          </Text>
        </TitleContainer>
        {hasActions && (
          <ActionsContainer>
            {actions?.map(({ label, onClick, isLoading, actionTestID }) =>
              isLoading ? (
                <AnimatedLoadingSpinner key={label} animationStart />
              ) : (
                <LinkButton key={label} onClick={onClick} disabled={isLoading} testID={actionTestID}>
                  {label}
                </LinkButton>
              ),
            )}
          </ActionsContainer>
        )}
      </Header>
      <FullWidthDiv>{content}</FullWidthDiv>
    </Container>
  );
};

const FullWidthDiv = styled.div`
  width: 100%;
`;

const ActionsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    width: 100%;
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[6]};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${theme.spacing[7]};
  `}
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
  align-items: center;
`;

export default Section;
