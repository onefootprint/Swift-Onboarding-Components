import Form from './components/form';
import Illustration from './components/illustration';
import NavigationBar from './components/navigation-bar';

type MockupScreenProps = {
  borderRadius: string;
  backgroundColor: string;
};

const MockupScreen = ({ borderRadius, backgroundColor }: MockupScreenProps) => (
  <div className="relative z-0 flex flex-col w-full mx-auto overflow-hidden border border-solid rounded isolate border-tertiary md:rounded-md min-h-fit">
    <NavigationBar />
    <div className="grid grid-cols-1 md:grid-cols-2 md:grid-template-cols-[1fr_1fr] md:aspect-[16/9] h-full min-h-[400px] border border-t-0 border-tertiary rounded-b-lg">
      <Illustration backgroundColor={backgroundColor} />
      <Form borderRadius={borderRadius} backgroundColor={backgroundColor} />
    </div>
  </div>
);

export default MockupScreen;
