import { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { LinkButton, LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';

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

const Section = ({
  title,
  IconComponent,
  actions,
  content,
  testID,
}: SectionProps) => {
  const hasActions = actions && actions?.length > 0;

  return (
    <Container data-testid={testID}>
      <Header>
        <TitleContainer>
          {IconComponent && <IconComponent />}
          <Typography sx={{ marginLeft: 2 }} variant="label-2">
            {title}
          </Typography>
        </TitleContainer>
        {hasActions && (
          <ActionsContainer>
            {actions?.map(({ label, onClick, isLoading, actionTestID }) =>
              isLoading ? (
                <LoadingIndicator key={label} />
              ) : (
                <LinkButton
                  key={label}
                  onClick={onClick}
                  disabled={isLoading}
                  testID={actionTestID}
                >
                  {label}
                </LinkButton>
              ),
            )}
          </ActionsContainer>
        )}
      </Header>
      <Content>{content}</Content>
    </Container>
  );
};

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    row-gap: ${theme.spacing[7]};
  `}
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
