type SectionTitleProps = {
  title: string;
  children?: React.ReactNode;
};

const SectionTitle = ({ title, children }: SectionTitleProps) => {
  return (
    <div className="w-full flex justify-between items-center flex-row gap-2 pb-2 border-b border-tertiary">
      <div className="text-label-2 text-primary">{title}</div>
      {children}
    </div>
  );
};

export default SectionTitle;
