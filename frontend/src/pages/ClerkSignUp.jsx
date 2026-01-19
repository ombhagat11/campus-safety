import { SignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ClerkSignUp = () => {
    const navigate = useNavigate();
    const [campusCode, setCampusCode] = useState("");

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Join Campus Safety
                    </h1>
                    <p className="text-gray-600">
                        Create an account to start reporting incidents
                    </p>
                </div>

                {/* Campus Code Input */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campus Code
                    </label>
                    <input
                        type="text"
                        value={campusCode}
                        onChange={(e) => setCampusCode(e.target.value.toUpperCase())}
                        placeholder="Enter your campus code"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                        Get your campus code from your institution's security office
                    </p>
                </div>

                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "shadow-2xl",
                        },
                    }}
                    routing="path"
                    path="/register"
                    signInUrl="/login"
                    afterSignUpUrl="/app/dashboard"
                    unsafeMetadata={{
                        campusCode: campusCode,
                    }}
                />

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        Already have an account?{" "}
                        <button
                            onClick={() => navigate("/login")}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Sign in here
                        </button>
                    </p>
                </div>

                {!campusCode && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            ⚠️ Please enter your campus code before registering
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClerkSignUp;
