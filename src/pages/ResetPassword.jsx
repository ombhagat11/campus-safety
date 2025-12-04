import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Shield, ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import authService from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token");
        }
    }, [token]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            await authService.resetPassword(token, formData.password);
            setSuccess(true);
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            const message = err.response?.data?.message || "Failed to reset password. Token may be expired.";
            const errors = err.response?.data?.errors;

            if (errors && errors.length > 0) {
                setError(errors.map(e => e.message).join(", "));
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700 animate-fade-in">
                    <div className="mb-6">
                        <div className="mx-auto w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Password Reset Successful!</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Your password has been updated. Redirecting you to login...
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full animate-[width_3s_linear_forwards]" style={{ width: "100%" }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 relative z-10">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                            <Lock className="w-6 h-6" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Set New Password</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Enter your new password below
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-fade-in">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="New Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        minLength={8}
                    />

                    <Input
                        label="Confirm New Password"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full mt-2"
                        isLoading={loading}
                        disabled={!token}
                    >
                        Reset Password
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
