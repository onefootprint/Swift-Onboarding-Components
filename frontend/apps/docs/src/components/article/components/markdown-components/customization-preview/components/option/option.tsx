import { Text } from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import styled, { css } from 'styled-components';

export type OptionProps = {
  image: string;
  name: string;
  onClick: () => void;
  selected: boolean;
};

const Option = ({ name, image, selected, onClick }: OptionProps) => {
  const { theme } = useTheme();
  const parts = image.split('/');
  const filename = parts.pop();
  const themedPath = `${parts.join('/')}/${theme}/${filename}`;

  return (
    <OptionContainer data-selected={selected} onClick={onClick}>
      <Image src={themedPath} width={120} height={97} alt={name} />
      <Text color="secondary" variant="body-3">
        {name}
      </Text>
    </OptionContainer>
  );
};

const OptionContainer = styled.button`
  ${({ theme }) => css`
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
    justify-content: center;
    margin: 0;
    padding: 0;

    img {
      border: ${theme.borderWidth[2]} solid transparent;
      border-radius: ${theme.spacing[3]};
    }

    &[data-selected='true'] img {
      border: ${theme.borderWidth[2]} solid ${theme.color.accent};
    }
  `}
`;

export default Option;
