import NextError from 'next/error';

const CustomErrorComponent = ({ statusCode }) => <NextError statusCode={statusCode} />;

CustomErrorComponent.getInitialProps = async contextData => NextError.getInitialProps(contextData); // This will contain the status code of the response

export default CustomErrorComponent;
