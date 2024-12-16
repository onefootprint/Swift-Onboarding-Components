type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return <div className="w-[500px] border border-gray-100 p-8">{children}</div>;
};

export default Layout;
