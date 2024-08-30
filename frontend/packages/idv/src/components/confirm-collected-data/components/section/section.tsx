import type { Icon } from '@onefootprint/icons';
import { LinkButton, LoadingSpinner, Text } from '@onefootprint/ui';
import type React from 'react';
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
  noBorder?: boolean;
};

const Section = ({ title, IconComponent, actions, content, testID, noBorder = false }: SectionProps) => {
  const hasActions = actions && actions?.length > 0;

  return (
    <Container data-testid={testID} $noBorder={noBorder}>
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
                <LoadingSpinner key={label} size={16} />
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
    align-items: center;
  `}
`;

const Container = styled.div<{ $noBorder: boolean }>`
  ${({ theme, $noBorder }) => css`
    width: 100%;
    border: ${$noBorder ? 'none' : `1px solid ${theme.borderColor.tertiary}`};
    border-radius: ${$noBorder ? 'none' : theme.borderRadius.default};
    padding: ${$noBorder ? 'none' : theme.spacing[6]};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `};
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
