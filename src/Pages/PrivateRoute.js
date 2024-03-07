// PrivateRoute.js
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContexts";

const PrivateRoute = ({ children, originalURL, ...rest }) => {
  const { userLoggedIn, setRedirectPath } = useAuth();

  useEffect(() => {
    if (!userLoggedIn) {
      // Store the original URL if the user is not authenticated
      setRedirectPath(originalURL);
    }
  }, [originalURL, setRedirectPath, userLoggedIn]);

  return userLoggedIn ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
