import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  Shield,
  Lock,
  Eye,
  Database,
  ChevronRight,
} from "lucide-react";

// Hero background image
const heroImage = "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=1920&q=80";

export default function Privacy() {
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
              <a href="https://soapboxsuperapp.com/quick-signup" target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white shadow-lg shadow-purple-500/25">
                  Get Started
                </Button>
              </a>
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
            <Shield className="w-4 h-4" />
            <span className="text-xs tracking-wide">YOUR DATA IS SAFE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Privacy</span>
            <span className="text-purple-300 font-extrabold"> Policy</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 font-medium max-w-2xl mx-auto">
            We are committed to protecting your privacy and your church's data.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">

        {/* Key Points */}
        <section className="mb-12">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No Data Selling</h3>
              <p className="text-sm text-gray-600">We never sell your data to third parties. Your information stays with you.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No Ad Tracking</h3>
              <p className="text-sm text-gray-600">We don't use invasive ad tracking or share your data with advertisers.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Storage</h3>
              <p className="text-sm text-gray-600">Your data is encrypted and stored securely with enterprise-grade protection.</p>
            </div>
          </div>
        </section>

        {/* Privacy Policy Content */}
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-500 text-sm mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
          <p className="text-gray-600 mb-6">
            SoapBox Super App ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Church Admin platform and related services.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
          <p className="text-gray-600 mb-4">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Account information (name, email, password)</li>
            <li>Church and organization details</li>
            <li>Member information you input into the system</li>
            <li>Donation and giving records</li>
            <li>Communication preferences</li>
            <li>Usage data and analytics</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-600 mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Protect against unauthorized access and security threats</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing</h2>
          <p className="text-gray-600 mb-6">
            We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and prevent fraud</li>
            <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
          <p className="text-gray-600 mb-6">
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
          <p className="text-gray-600 mb-6">
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy. You may request deletion of your data at any time by contacting us.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
          <p className="text-gray-600 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt out of marketing communications</li>
            <li>Export your data in a portable format</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
          <p className="text-gray-600 mb-6">
            Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child, please contact us immediately.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
          <p className="text-gray-600 mb-6">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div className="bg-purple-50 rounded-xl p-6 mb-6">
            <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@soapboxsuperapp.com</p>
            <p className="text-gray-700 mb-2"><strong>Address:</strong> SoapBox Super App, 1130 E. Clark Street, #150-204, Orcutt, CA 93455, USA</p>
          </div>
        </div>

        {/* CTA */}
        <section className="mt-16 relative bg-gradient-to-br from-[#7C3AED] via-[#5B21B6] to-[#2563EB] rounded-2xl p-8 sm:p-10 text-center text-white overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h2>
            <p className="text-purple-100 mb-6">
              We're here to help. Contact our privacy team for any questions or concerns.
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
