import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import authService from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await authService.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send reset email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700 animate-fade-in">
                    <div className="mb-6">
                        <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Check Your Email</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
                    </p>
                    <Link
                        to="/login"
                    >
                        <Button variant="primary" className="w-full">
                            Back to Login
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
            </div>

            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700 relative z-10">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                            <Shield className="w-7 h-7" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Enter your email to receive a reset link
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-fade-in">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                        }}
                        placeholder="student@university.edu"
                        required
                        autoFocus
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        isLoading={loading}
                    >
                        Send Reset Link
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
