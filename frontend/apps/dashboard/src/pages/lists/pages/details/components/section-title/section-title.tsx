type SectionTitleProps = {
  title: string;
  children?: React.ReactNode;
};

const SectionTitle = ({ title, children }: SectionTitleProps) => {
  return (
    <div className="flex flex-row items-center justify-between w-full gap-2 pb-2 border-b border-solid border-tertiary">
      <div className="text-label-2 text-primary">{title}</div>
      {children}
    </div>
  );
};

export default SectionTitle;
