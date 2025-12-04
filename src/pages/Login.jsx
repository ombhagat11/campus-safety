import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import authService from "../services/authService";
import useAuthStore from "../stores/authStore";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Login() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

        try {
            await authService.login(formData);
            navigate("/app/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-900">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-[480px] relative z-10">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-10">
                        <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-8">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                                <Shield className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">CampusSafe</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="student@university.edu"
                            required
                            autoComplete="email"
                        />

                        <div className="space-y-1">
                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                            <div className="flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            isLoading={loading}
                        >
                            Sign in
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Don't have an account?{" "}
                            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Gradient */}
            <div className="hidden lg:block relative flex-1 bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-indigo-900 opacity-90" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay opacity-50" />
                <div className="relative h-full flex flex-col justify-end p-16 text-white">
                    <div className="max-w-xl">
                        <h2 className="text-4xl font-bold mb-6">Safe Campus, Better Future.</h2>
                        <p className="text-lg text-primary-100 leading-relaxed">
                            Join our community-driven safety platform. Report incidents, stay informed, and help make our campus a safer place for everyone.
                        </p>

                        <div className="mt-12 flex items-center gap-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-primary-500 bg-slate-800 flex items-center justify-center text-xs font-medium">
                                        U{i}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-medium text-primary-200">Joined by 2,000+ students</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
