// components/Legal/Privacy.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Calendar } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative blurs - hidden on very small screens to prevent overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-300 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-full mx-auto">
        {/* Header - stacks on mobile */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            to="/register"
            className="inline-flex items-center text-amber-700 hover:text-amber-800 font-medium transition-colors group self-start"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Registration
          </Link>
          <div className="flex items-center text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm self-start sm:self-auto">
            <Calendar className="w-4 h-4 mr-2 text-amber-500 flex-shrink-0" />
            <span>Last Updated: March 4, 2026</span>
          </div>
        </div>

        {/* Main content card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-8 md:p-12 border border-amber-100">
          {/* Title with icon */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="p-2 sm:p-3 bg-amber-100 rounded-xl sm:rounded-2xl">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-amber-700" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Privacy Policy
            </h1>
          </div>

          {/* Content - spacing adjusts for mobile */}
          <div className="space-y-4 sm:space-y-6 text-gray-700 text-sm sm:text-base">
            <p className="text-base sm:text-lg border-l-4 border-amber-400 pl-4 italic text-gray-600">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-6 sm:mt-8 mb-3 sm:mb-4">1. Introduction</h2>
              <p className="mb-3 sm:mb-4">
                ABCDE Nutrition (“Company”, “we”, “our”, “us”) respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services. Please read it carefully.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-6 sm:mt-8 mb-3 sm:mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-2 sm:mb-3">2.1 Personal Data</h3>
              <p className="mb-2">We may collect personally identifiable information, such as:</p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-2 sm:ml-4">
                <li>Name, email address, phone number, username</li>
                <li>Billing and payment information (processed securely via third-party providers)</li>
                <li>Demographic information such as age, gender, health goals</li>
                <li>Any information you voluntarily provide (e.g., via forms, surveys)</li>
              </ul>

              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-2 sm:mb-3">2.2 Health & Wellness Data</h3>
              <p className="mb-4">
                To provide personalized nutrition plans, we may collect health-related information such as dietary preferences, allergies, weight, height, activity level, and health conditions you choose to share. This data is treated with extra care and used only to tailor our services.
              </p>

              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-2 sm:mb-3">2.3 Automatically Collected Data</h3>
              <p className="mb-4">
                When you use our Services, we may automatically collect information such as IP address, browser type, operating system, referring URLs, and usage data via cookies and similar technologies.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-6 sm:mt-8 mb-3 sm:mb-4">3. How We Use Your Information</h2>
              <p className="mb-2">We use your information to:</p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-2 sm:ml-4">
                <li>Provide, operate, and maintain our Services</li>
                <li>Create and manage your account</li>
                <li>Personalize your experience and deliver tailored nutrition plans</li>
                <li>Process transactions and send related communications</li>
                <li>Improve our website, products, and customer service</li>
                <li>Send you updates, marketing communications (with opt-out option)</li>
                <li>Comply with legal obligations and prevent fraud</li>
              </ul>
            </section>

            {/* Continue with all other sections using the same responsive pattern... */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-6 sm:mt-8 mb-3 sm:mb-4">4. Sharing Your Information</h2>
              <p className="mb-2">We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-2 sm:ml-4">
                <li><span className="font-medium">Service Providers:</span> Third-party vendors who help us operate (e.g., payment processors, hosting, email services). They are contractually bound to protect your data.</li>
                <li><span className="font-medium">Legal Requirements:</span> If required by law or to protect our rights, safety, or property.</li>
                <li><span className="font-medium">Business Transfers:</span> In the event of a merger, acquisition, or asset sale, your information may be transferred.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-6 sm:mt-8 mb-3 sm:mb-4">5. Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar technologies to enhance your experience, analyze trends, and administer the site. You can control cookies through your browser settings. Disabling cookies may affect functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-6 sm:mt-8 mb-3 sm:mb-4">6. Data Security</h2>
              <p className="mb-4">
                We implement reasonable technical and organizational measures to protect your information. However, no method of transmission over the Internet is 100% secure. You use our Services at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-6 sm:mt-8 mb-3 sm:mb-4">7. Your Rights and Choices</h2>
              <p className="mb-2">Depending on your location, you may have the right to:</p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-2 sm:ml-4">
                <li>Access, correct, or delete your personal data</li>
                <li>Withdraw consent at any time</li>
                <li>Object to or restrict processing</li>
                <li>Data portability</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
              <p>To exercise your rights, contact us at <a href="mailto:privacy@abcdenutrition.com" className="text-amber-600 hover:text-amber-700 font-medium break-all">privacy@abcdenutrition.com</a>.</p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-6 sm:mt-8 mb-3 sm:mb-4">8. Data Retention</h2>
              <p className="mb-4">
                We retain your personal data as long as your account is active or as needed to provide Services, comply with legal obligations, resolve disputes, and enforce agreements. You may request deletion of your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-6 sm:mt-8 mb-3 sm:mb-4">9. Children's Privacy</h2>
              <p className="mb-4">
                Our Services are not directed to individuals under 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will delete it.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-6 sm:mt-8 mb-3 sm:mb-4">10. International Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to and maintained on servers located outside your country of residence. By using our Services, you consent to such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-6 sm:mt-8 mb-3 sm:mb-4">11. Third-Party Links</h2>
              <p className="mb-4">
                Our Services may contain links to third-party websites. We are not responsible for their privacy practices. We encourage you to read their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-6 sm:mt-8 mb-3 sm:mb-4">12. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of material changes by email or a prominent notice on our website. Your continued use constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-6 sm:mt-8 mb-3 sm:mb-4">13. Contact Us</h2>
              <p className="mb-2">
                If you have any questions about this Privacy Policy, please contact us:<br />
                <span className="font-medium">Email:</span>{' '}
                <a href="mailto:privacy@abcdenutrition.com" className="text-amber-600 hover:text-amber-700 font-medium break-all">
                  privacy@abcdenutrition.com
                </a><br />
                <span className="font-medium">Address:</span> P.O. Box 12345, Nairobi, Kenya
              </p>
            </section>
          </div>

          <div className="mt-8 sm:mt-10 pt-6 border-t border-amber-200 text-center text-xs sm:text-sm text-gray-500">
            <p>© {new Date().getFullYear()} ABCDE Nutrition. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;