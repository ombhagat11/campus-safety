import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, CheckCircle2 } from "lucide-react";
import authService from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        campusCode: "",
        phone: "",
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

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...registrationData } = formData;
            const response = await authService.register(registrationData);

            // Registration successful - redirect to OTP verification
            if (response.success) {
                navigate("/verify-email", {
                    state: { email: formData.email },
                    replace: true
                });
            }
        } catch (err) {
            const message = err.response?.data?.message || "Registration failed. Please try again.";
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

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-900">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-[540px] relative z-10 overflow-y-auto">
                <div className="mx-auto w-full max-w-sm lg:w-[400px]">
                    <div className="mb-8">
                        <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                                <Shield className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">CampusSafe</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Create an account</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Join your campus community today.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5">
                            <Input
                                label="Full Name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="student@university.edu"
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Campus Code"
                                    type="text"
                                    name="campusCode"
                                    value={formData.campusCode}
                                    onChange={handleChange}
                                    placeholder="TEST-U"
                                    required
                                    className="uppercase"
                                />
                                <Input
                                    label="Phone (Optional)"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 234..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                isLoading={loading}
                            >
                                Create Account
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Gradient */}
            <div className="hidden lg:block relative flex-1 bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-bl from-indigo-900 to-primary-900 opacity-90" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay opacity-40" />
                <div className="relative h-full flex flex-col justify-end p-16 text-white">
                    <div className="max-w-xl">
                        <h2 className="text-4xl font-bold mb-6">Your Safety, Our Priority.</h2>
                        <p className="text-lg text-primary-100 leading-relaxed">
                            "CampusSafe has transformed how we handle security on campus. It's fast, reliable, and keeps everyone connected."
                        </p>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-xl">
                                🎓
                            </div>
                            <div>
                                <p className="font-semibold">Student Council</p>
                                <p className="text-sm text-primary-200">University Partner</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
