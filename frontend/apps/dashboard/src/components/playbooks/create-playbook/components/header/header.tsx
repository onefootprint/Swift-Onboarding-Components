type HeaderProps = {
  title: string;
  subtitle?: string;
};

const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <header className="flex flex-col gap-1">
      <h2 className="text-label-1 text-primary">{title}</h2>
      {subtitle && <h3 className="text-body-2 text-secondary">{subtitle}</h3>}
    </header>
  );
};

export default Header;
