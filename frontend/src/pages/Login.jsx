import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, Copy, Check, User, ShieldCheck, GraduationCap } from "lucide-react";
import authService from "../services/authService";
import useAuthStore from "../stores/authStore";

export default function Login() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError("");
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await authService.login(formData);
            navigate("/app/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const demoUsers = [
        { role: "Admin", email: "admin@test-university.edu", pass: "Admin@123456", icon: ShieldCheck, color: "red" },
        { role: "Moderator", email: "moderator@test-university.edu", pass: "Mod@123456", icon: User, color: "amber" },
        { role: "Student", email: "student@test-university.edu", pass: "Student@123456", icon: GraduationCap, color: "emerald" }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 px-4 py-12">
            <div className="max-w-md w-full">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                    <div className="p-8">
                        <div className="text-center mb-10">
                            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                                <ShieldCheck className="text-white w-10 h-10" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Campus Safety</h1>
                            <p className="text-gray-500 font-medium">Secure Portal Access</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center">
                                <span className="text-red-600 text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none"
                                        placeholder="name@university.edu"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <label className="flex items-center cursor-pointer group">
                                    <input type="checkbox" className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                    <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors font-medium">Remember me</span>
                                </label>
                                <Link to="/forgot-password" weights="medium" className="text-sm text-blue-600 hover:text-blue-700 font-bold">
                                    Forgot security key?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-xl shadow-blue-200 transition-all transform active:scale-[0.98] disabled:bg-blue-300 disabled:shadow-none"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>Sign In to Dashboard</span>
                                        <LogIn className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-500 text-sm font-medium">
                                Institutional partner?{" "}
                                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold ml-1">
                                    Register Portal
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Demo Credentials Section */}
                    <div className="bg-gray-50/80 border-t border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Testing Accounts</h3>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-bold">QA MODE</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {demoUsers.map((user) => (
                                <div
                                    key={user.role}
                                    onClick={() => setFormData({ email: user.email, password: user.pass })}
                                    className="group relative bg-white border border-gray-200 p-4 rounded-2xl cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-xl bg-${user.color}-50`}>
                                                <user.icon className={`w-5 h-5 text-${user.color}-600`} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-800 leading-none mb-1">{user.role}</h4>
                                                <p className="text-[11px] text-gray-500 font-mono">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); copyToClipboard(user.email, `${user.role}-id`); }}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Copy ID"
                                            >
                                                {copiedId === `${user.role}-id` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); copyToClipboard(user.pass, `${user.role}-pw`); }}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Copy PW"
                                            >
                                                {copiedId === `${user.role}-pw` ? <Check className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-[10px] text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        TAP TO AUTO-FILL FORM
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link to="/" className="inline-flex items-center text-white/70 hover:text-white text-sm font-bold transition-colors">
                        <span className="mr-2">←</span>
                        Back to Landing Page
                    </Link>
                </div>
            </div>
        </div>
    );
}
