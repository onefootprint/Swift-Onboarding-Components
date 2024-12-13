import { IdentifyLogin } from './components/identify-login';
import type { DoneArgs, InitArgs } from './identify.types';

type IdentifyProps = {
  onDone: (args: DoneArgs) => void;
  initArgs: InitArgs;
};

const Identify = ({ onDone, initArgs }: IdentifyProps) => {
  return <IdentifyLogin initialArgs={initArgs} onDone={onDone} />;
};

export default Identify;
