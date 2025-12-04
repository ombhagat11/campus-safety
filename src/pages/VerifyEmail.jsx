import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../services/apiClient';
import useAuthStore from '../stores/authStore';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Mail, Shield, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setAuth, logout } = useAuthStore();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [email, setEmail] = useState(location.state?.email || '');

    useEffect(() => {
        if (!email) {
            toast.error('Email not found. Please register again.');
            navigate('/register');
        }
    }, [email, navigate]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            value = value[0];
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setOtp(newOtp);

        // Focus last filled input
        const lastIndex = Math.min(pastedData.length, 5);
        document.getElementById(`otp-${lastIndex}`)?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            toast.error('Please enter the complete 6-digit OTP');
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post('/auth/verify-email-otp', {
                email,
                otp: otpCode,
            });

            if (response.data.success) {
                toast.success('Email verified successfully!');
                setAuth(response.data.data);
                navigate('/app/dashboard');
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            setResending(true);
            const response = await apiClient.post('/auth/resend-otp', { email });

            if (response.data.success) {
                toast.success('OTP sent successfully! Check your email.');
                setOtp(['', '', '', '', '', '']);
                document.getElementById('otp-0')?.focus();
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    const handleBackToLogin = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Verify Your Email
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        We've sent a 6-digit code to
                    </p>
                    <p className="text-primary-600 dark:text-primary-400 font-semibold mt-1">
                        {email}
                    </p>
                </div>

                {/* OTP Input Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 text-center">
                            Enter OTP Code
                        </label>
                        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-800 dark:text-white transition-all"
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Security Note */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-3 rounded">
                        <div className="flex items-start gap-2">
                            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                This code will expire in <strong>10 minutes</strong>. Don't share it with anyone.
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={loading || otp.join('').length !== 6}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Verifying...
                            </div>
                        ) : (
                            'Verify Email'
                        )}
                    </Button>

                    {/* Resend OTP */}
                    <div className="text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            Didn't receive the code?
                        </p>
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={resending}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm transition-colors disabled:opacity-50"
                        >
                            {resending ? 'Sending...' : 'Resend OTP'}
                        </button>
                    </div>

                    {/* Back to Login */}
                    <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="w-full flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default VerifyEmail;
