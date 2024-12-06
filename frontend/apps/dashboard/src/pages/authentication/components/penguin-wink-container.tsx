import { ThemedLogoFpCompact } from '@onefootprint/icons';
import ContainerBox from './container-box';
import Layout from './layout';
import PenguinWink from './penguin-wink';

type PenguinWinkContainerProps = {
  children: React.ReactNode;
};

const PenguinWinkContainer = ({ children }: PenguinWinkContainerProps) => (
  <Layout>
    <div className="relative w-full sm:w-[410px]">
      <ContainerBox>
        <ThemedLogoFpCompact color="primary" />
        {children}
      </ContainerBox>
      <div className="absolute top-[2px] right-[30px] z-0 w-[140px] h-fit transform -translate-y-full">
        <PenguinWink />
      </div>
    </div>
  </Layout>
);

export default PenguinWinkContainer;
