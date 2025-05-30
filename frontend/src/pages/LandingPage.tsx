import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield, Zap, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Mail className="h-8 w-8 text-indigo-500" />
          <span className="text-xl font-bold">MailSync</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
          <Link
            to="/register"
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-8">
          Take Control of Your
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
            {" "}Email Analytics
          </span>
        </h1>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Understand your email patterns, identify top senders, and optimize your inbox
          with powerful analytics and insights.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center px-8 py-3 text-lg font-medium rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          Start Free Trial
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="bg-indigo-900 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Email Sync</h3>
            <p className="text-gray-400">
              Seamlessly sync your inbox and get real-time analytics about your email usage.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-900 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Instant Analysis</h3>
            <p className="text-gray-400">
              Get immediate insights about your email patterns and communication habits.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-900 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Secure & Private</h3>
            <p className="text-gray-400">
              Your data is encrypted and protected. We prioritize your privacy and security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;