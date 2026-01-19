import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { initializeApiClient } from "../services/apiClient";

/**
 * ApiClientInitializer Component
 * Initializes the API client with Clerk's getToken function
 * This ensures all API requests include the Clerk session token
 */
const ApiClientInitializer = ({ children }) => {
    const { getToken } = useAuth();

    useEffect(() => {
        // Initialize API client with Clerk's getToken
        initializeApiClient(getToken);
    }, [getToken]);

    return children;
};

export default ApiClientInitializer;
