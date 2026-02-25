import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  FileText,
  Scale,
  ChevronRight,
} from "lucide-react";

// Hero background image
const heroImage = "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=1920&q=80";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo size="sm" />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Features</Link>
              <Link href="/about" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Contact</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-purple-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white shadow-lg shadow-purple-500/25">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" loading="eager" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/80" />
          <div className="absolute inset-0 bg-purple-900/20" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white rounded-full px-5 py-2.5 mb-8 text-sm font-medium border border-white/20">
            <Scale className="w-4 h-4" />
            <span className="text-xs tracking-wide">LEGAL AGREEMENT</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Terms of</span>
            <span className="text-purple-300 font-extrabold"> Service</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 font-medium max-w-2xl mx-auto">
            Please read these terms carefully before using our services.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">

        {/* Key Points */}
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Clear & Transparent</h3>
              <p className="text-sm text-gray-600">Our terms are written in plain language to ensure you understand your rights and responsibilities.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fair & Balanced</h3>
              <p className="text-sm text-gray-600">We believe in mutual respect between us and our users. These terms protect both parties fairly.</p>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-500 text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 mb-6">
            By accessing or using SoapBox Church Admin ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service. These terms apply to all users, including churches, administrators, and members.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
          <p className="text-gray-600 mb-6">
            SoapBox Church Admin is a church management platform that provides tools for member management, donation tracking, event scheduling, volunteer coordination, and communication. The Service is provided as part of the SoapBox Super App subscription.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
          <p className="text-gray-600 mb-4">To use the Service, you must:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Be at least 18 years old</li>
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
          <p className="text-gray-600 mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Use the Service for any unlawful purpose</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the rights of others</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Upload malicious code or content</li>
            <li>Use the Service for spam or unsolicited communications</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Content and Data</h2>
          <p className="text-gray-600 mb-6">
            You retain ownership of all content and data you upload to the Service. By using the Service, you grant us a limited license to store, process, and display your content as necessary to provide the Service. You are responsible for ensuring you have the right to upload any content.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Terms</h2>
          <p className="text-gray-600 mb-6">
            Church Admin is included with your SoapBox Super App subscription at no additional cost. Subscription fees are billed according to your chosen plan. All fees are non-refundable except as required by law or as explicitly stated in our refund policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
          <p className="text-gray-600 mb-6">
            The Service and its original content, features, and functionality are owned by SoapBox Super App and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our Service without permission.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
          <p className="text-gray-600 mb-6">
            We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. Upon termination, your right to use the Service will immediately cease.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimer of Warranties</h2>
          <p className="text-gray-600 mb-6">
            The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free. We disclaim all warranties, including merchantability, fitness for a particular purpose, and non-infringement.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
          <p className="text-gray-600 mb-6">
            To the maximum extent permitted by law, SoapBox Super App shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of the Service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
          <p className="text-gray-600 mb-6">
            You agree to defend, indemnify, and hold harmless SoapBox Super App and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
          <p className="text-gray-600 mb-6">
            These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the state or federal courts located in Santa Barbara County, California.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
          <p className="text-gray-600 mb-6">
            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after any changes indicates your acceptance of the new Terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about these Terms, please contact us at:
          </p>
          <div className="bg-purple-50 rounded-xl p-6 mb-6">
            <p className="text-gray-700 mb-2"><strong>Email:</strong> legal@soapboxsuperapp.com</p>
            <p className="text-gray-700 mb-2"><strong>Address:</strong> SoapBox Super App, 1130 E. Clark Street, #150-204, Orcutt, CA 93455, USA</p>
          </div>
        </div>

        {/* CTA */}
        <section className="mt-16 relative bg-gradient-to-br from-[#7C3AED] via-[#5B21B6] to-[#2563EB] rounded-2xl p-8 sm:p-10 text-center text-white overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Questions About Our Terms?</h2>
            <p className="text-purple-100 mb-6">
              We're here to help clarify any questions about our terms and conditions.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 font-semibold shadow-xl"
              >
                Contact Us
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Logo size="sm" />
              <p className="text-gray-400 mt-4 mb-4">
                The complete church management platform powered by SoapBox Super App.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} SoapBox Super App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
