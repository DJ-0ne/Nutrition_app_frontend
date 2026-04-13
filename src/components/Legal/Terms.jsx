// components/Legal/Terms.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-300 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/register"
            className="inline-flex items-center text-amber-700 hover:text-amber-800 font-medium transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Registration
          </Link>
          <div className="flex items-center text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
            <Calendar className="w-4 h-4 mr-2 text-amber-500" />
            Last Updated: March 4, 2026
          </div>
        </div>

        {/* Content card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-amber-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-100 rounded-2xl">
              <FileText className="w-8 h-8 text-amber-700" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Terms of Service
            </h1>
          </div>

          <div className="space-y-6 text-gray-700">
            <p className="text-lg border-l-4 border-amber-400 pl-4 italic text-gray-600">
              Welcome to ABCDE Nutrition. By using our services, you agree to these terms. Please read them carefully.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing or using our website, mobile application, or any services provided by ABCDE Nutrition ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, you may not use our Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Eligibility</h2>
              <p className="mb-4">
                You must be at least 18 years old to use our Services. By agreeing to these Terms, you represent and warrant that you are at least 18 years of age. If you are using the Services on behalf of an organization, you represent that you have authority to bind that organization.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Health Disclaimer</h2>
              <p className="mb-4">
                ABCDE Nutrition provides personalized nutrition plans, educational content, and coaching services. The information provided is for general informational purposes only and is not intended as medical advice. You should consult with a qualified healthcare professional before starting any nutrition or fitness program. We do not diagnose, treat, or cure any medical condition. You assume full responsibility for your health and well-being.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Account Registration</h2>
              <p className="mb-4">
                To access certain features, you must create an account. You agree to provide accurate, current, and complete information and to update it as necessary. You are responsible for safeguarding your password and for all activities under your account. Notify us immediately of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. User Conduct</h2>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
                <li>Use the Services for any illegal purpose</li>
                <li>Harass, abuse, or harm others</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with the security or functionality of the Services</li>
                <li>Copy, modify, or distribute our content without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">6. Payments and Refunds</h2>
              <p className="mb-4">
                Some Services may require payment. Fees are non-refundable except as required by law or as explicitly stated. We may change fees with 30 days' notice. Subscription plans auto-renew unless cancelled before renewal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">7. Intellectual Property</h2>
              <p className="mb-4">
                All content, including logos, text, graphics, and software, is owned by ABCDE Nutrition or its licensors and is protected by copyright and trademark laws. You may not use our trademarks without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">8. Termination</h2>
              <p className="mb-4">
                We may suspend or terminate your account at any time for violation of these Terms or for any other reason at our sole discretion. You may cancel your account at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">9. Limitation of Liability</h2>
              <p className="mb-4">
                To the maximum extent permitted by law, ABCDE Nutrition shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Services. Our total liability shall not exceed the amount you paid us in the past 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">10. Indemnification</h2>
              <p className="mb-4">
                You agree to indemnify and hold harmless ABCDE Nutrition, its affiliates, and their respective officers, directors, employees, and agents from any claims arising out of your use of the Services or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">11. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be governed by the laws of Kenya, without regard to its conflict of laws principles. Any disputes shall be resolved in the courts of Nairobi, Kenya.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">12. Changes to Terms</h2>
              <p className="mb-4">
                We may update these Terms from time to time. We will notify you of material changes via email or prominent notice on our website. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">13. Contact Us</h2>
              <p className="mb-2">
                If you have any questions about these Terms, please contact us at:<br />
                <span className="font-medium">Email:</span>{' '}
                <a href="mailto:legal@abcdenutrition.com" className="text-amber-600 hover:text-amber-700 font-medium">
                  legal@abcdenutrition.com
                </a><br />
                <span className="font-medium">Address:</span> P.O. Box 12345, Nairobi, Kenya
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-amber-200 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} ABCDE Nutrition. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;