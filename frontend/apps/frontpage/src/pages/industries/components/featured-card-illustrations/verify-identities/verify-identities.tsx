import type { Icon } from '@onefootprint/icons';
import { IcoBuilding16, IcoCake16, IcoCar16, IcoFileText16, IcoPhone16, IcoUserCircle16 } from '@onefootprint/icons';
import { Box, Stack, createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type ChipProps = {
  label: string;
  icon: Icon;
  position: ChipPosition;
};

type ChipPosition = {
  top: string;
  left: string;
  rotate: string;
  elevation: 1 | 2 | 3;
};

const chips: ChipProps[] = [
  {
    label: 'Name',
    icon: IcoUserCircle16,
    position: {
      top: '10%',
      left: '85%',
      rotate: '-10deg',
      elevation: 1,
    },
  },
  {
    label: 'Address',
    icon: IcoBuilding16,
    position: {
      top: '80%',
      left: '10%',
      rotate: '5deg',
      elevation: 1,
    },
  },
  {
    label: 'Social Security Number',
    icon: IcoFileText16,
    position: {
      top: '50%',
      left: '50%',
      rotate: '0deg',
      elevation: 1,
    },
  },
  {
    label: 'Phone Number',
    icon: IcoPhone16,
    position: {
      top: '70%',
      left: '75%',
      rotate: '-5deg',
      elevation: 1,
    },
  },
  {
    label: "Driver's License",
    icon: IcoCar16,
    position: {
      top: '10%',
      left: '50%',
      rotate: '10deg',
      elevation: 1,
    },
  },
  {
    label: 'Date of Birth',
    icon: IcoCake16,
    position: {
      top: '20%',
      left: '15%',
      rotate: '5deg',
      elevation: 1,
    },
  },
];

export const VerifyCredit = () => {
  const renderIcon = (IconComponent: Icon) => <IconComponent />;
  return (
    <IllustrationContainer>
      {chips.map(chip => (
        <ChipContainer key={chip.label} $position={chip.position}>
          {renderIcon(chip.icon)}
          {chip.label}
        </ChipContainer>
      ))}
    </IllustrationContainer>
  );
};

const IllustrationContainer = styled(Box)`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: url('/industries/featured-cards/request-more-info/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: repeat;
  background-size: 120% 120%;
  mask: linear-gradient(to bottom, black 0%, black 70%, transparent 100%);
  mask-size: 100% 100%;
  mask-position: center;
  mask-repeat: repeat;
  mask-type: alpha;
`;

const ChipContainer = styled(Stack)<{
  $position: ChipPosition;
}>`
  ${({ theme, $position }) => css`
    ${createFontStyles('label-3')}
    position: absolute;
    flex-direction: row;
    gap: ${theme.spacing[3]};
    white-space: nowrap;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.backgroundColor.primary};
    top: ${$position.top};
    left: ${$position.left};
    transform: translate(-50%, -50%) rotate(${$position.rotate});
    box-shadow: ${theme.elevation[$position.elevation]};
  `}
`;
export default VerifyCredit;
