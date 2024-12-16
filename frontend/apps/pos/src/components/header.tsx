type HeaderProps = {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

const Header = ({ title, subtitle, children }: HeaderProps) => {
  return (
    <header className="mb-6">
      {children}
      <h1 className="text-heading-3 text-primary">{title}</h1>
      <h2 className="text-body-2 text-secondary">{subtitle}</h2>
    </header>
  );
};

export default Header;
