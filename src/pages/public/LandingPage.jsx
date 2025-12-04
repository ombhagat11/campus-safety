import { Link } from "react-router-dom";
import Hero from "../../components/home/Hero";
import Features from "../../components/home/Features";
import HowItWorks from "../../components/home/HowItWorks";
import Footer from "../../components/home/Footer";

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                🛡️ Campus Safety
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                to="/login"
                                className="text-gray-700 hover:text-gray-900 font-medium"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <Hero />

            {/* Features Section */}
            <Features />

            {/* How It Works */}
            <HowItWorks />

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Make Your Campus Safer?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of students already using Campus Safety to create a secure environment.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg"
                        >
                            Sign Up Now
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-bold text-lg"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default LandingPage;
