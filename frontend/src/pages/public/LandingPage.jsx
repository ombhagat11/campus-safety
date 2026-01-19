import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, Users, TrendingUp, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import Button from '../../components/common/Button';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <AlertTriangle className="w-6 h-6" />,
            title: 'Real-time Reporting',
            description: 'Report incidents instantly with photos, location, and detailed descriptions.'
        },
        {
            icon: <MapPin className="w-6 h-6" />,
            title: 'Interactive Maps',
            description: 'View nearby incidents on an interactive map with geospatial filtering.'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Role-Based Access',
            description: 'Secure multi-tier authentication for students, moderators, and admins.'
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: 'Community Driven',
            description: 'Vote and comment on reports to help verify incidents.'
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: 'Analytics Dashboard',
            description: 'Comprehensive insights and trends for administrators.'
        },
        {
            icon: <CheckCircle className="w-6 h-6" />,
            title: 'Quick Response',
            description: 'Moderators can verify and resolve reports efficiently.'
        }
    ];

    const stats = [
        { value: '1000+', label: 'Reports Handled' },
        { value: '<500ms', label: 'Query Speed' },
        { value: '24/7', label: 'Monitoring' },
        { value: '98%', label: 'Uptime' }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-lg border-b border-slate-200 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                                CS
                            </div>
                            <span className="text-xl font-bold text-gradient">Campus Safety</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/register')}
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                            Keep Your Campus
                            <span className="text-gradient block mt-2">Safe & Secure</span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
                            A modern platform for real-time incident reporting and tracking.
                            Empowering students, moderators, and administrators to collaborate
                            in maintaining a safe campus environment.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Button
                                variant="primary"
                                size="lg"
                                icon={<ArrowRight className="w-5 h-5" />}
                                iconPosition="right"
                                onClick={() => navigate('/register')}
                            >
                                Start Reporting
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate('/about')}
                            >
                                Learn More
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                                <div className="text-slate-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Everything you need to maintain campus safety in one platform
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 card-hover"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white mb-4 shadow-lg">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Make Your Campus Safer?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of students and administrators using Campus Safety
                    </p>
                    <Button
                        variant="primary"
                        size="xl"
                        icon={<ArrowRight className="w-5 h-5" />}
                        iconPosition="right"
                        onClick={() => navigate('/register')}
                        className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl"
                    >
                        Get Started Now
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                    CS
                                </div>
                                <span className="text-xl font-bold">Campus Safety</span>
                            </div>
                            <p className="text-slate-400">
                                Making campuses safer, one report at a time.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-slate-400">
                                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-slate-400">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-slate-400">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">License</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
                        <p>&copy; 2026 Campus Safety. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
