import Error from "next/error";
import React from "react";

const CustomErrorComponent = ({ statusCode }) => <Error statusCode={statusCode} />;

CustomErrorComponent.getInitialProps = async (contextData) => 
  Error.getInitialProps(contextData) // This will contain the status code of the response
;

export default CustomErrorComponent;
