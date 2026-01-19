import { SignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const ClerkSignIn = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Campus Safety
                    </h1>
                    <p className="text-gray-600">
                        Sign in to report and track campus incidents
                    </p>
                </div>

                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "shadow-2xl",
                        },
                    }}
                    routing="path"
                    path="/login"
                    signUpUrl="/register"
                    afterSignInUrl="/app/dashboard"
                />

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        Don't have an account?{" "}
                        <button
                            onClick={() => navigate("/register")}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Register here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ClerkSignIn;
