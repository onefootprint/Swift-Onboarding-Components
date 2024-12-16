type LayoutProps = {
  children: React.ReactNode;
  onClose?: () => void;
};

const Layout = ({ children, onClose }: LayoutProps) => {
  return (
    <div className="w-[500px] border border-gray-100 p-8 relative">
      {onClose && (
        <nav className="flex justify-start p-3 -mt-3">
          <button type="button" onClick={onClose} className=" right-4 top-4 text-gray-500 hover:text-gray-700">
            <svg
              width="24"
              height="24"
              fill="#000000"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              data-colored="false"
            >
              <path
                d="M6.9 6.259a1.438 1.438 0 0 1-.147.037c-.236.052-.51.407-.512.664-.002.336-.031.303 2.392 2.73L10.939 12l-2.305 2.31c-2.481 2.486-2.431 2.427-2.376 2.79a.755.755 0 0 0 .947.62c.157-.041.409-.28 2.485-2.353L12 13.061l2.31 2.306c2.076 2.073 2.328 2.312 2.485 2.353a.75.75 0 0 0 .925-.925c-.041-.157-.28-.409-2.353-2.485L13.061 12l2.306-2.31C17.744 7.31 17.76 7.292 17.76 7c0-.245-.189-.551-.411-.666-.134-.069-.424-.089-.609-.04-.085.022-.786.696-2.43 2.338L12 10.939 9.71 8.654C8.45 7.397 7.384 6.351 7.34 6.329c-.092-.045-.38-.091-.44-.07"
                fillRule="evenodd"
                fill="#000000"
              />
            </svg>
          </button>
        </nav>
      )}
      {children}
    </div>
  );
};

export default Layout;
