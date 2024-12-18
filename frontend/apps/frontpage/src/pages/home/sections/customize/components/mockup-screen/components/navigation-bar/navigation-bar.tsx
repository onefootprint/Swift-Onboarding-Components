import { uniqueId } from 'lodash';

const NavigationBar = () => {
  return (
    <div className="flex items-center justify-start w-full h-8 gap-3 p-5 border-b border-solid rounded-t-md bg-secondary border-tertiary">
      {[...Array(3)].map(_ => (
        <div key={uniqueId()} className="w-2 h-2 bg-[#d9d9d9] rounded-full" />
      ))}
    </div>
  );
};

export default NavigationBar;
