import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  Users,
  DollarSign,
  Calendar,
  Mail,
  Heart,
  BookOpen,
  Shield,
  Zap,
  ChevronRight,
  Play,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="sm" />

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-sage-700 hover:bg-sage-800 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-sage-50 to-sage-100">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Manage Your Church
            <span className="text-sage-700"> With Confidence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The complete church management platform that helps pastors and ministry leaders
            shepherd their congregations, track giving, and nurture spiritual growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-sage-700 hover:bg-sage-800 text-white px-8 py-4 text-lg"
              >
                Start Free Trial
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg border-gray-300 hover:bg-gray-50"
              onClick={() => window.open('https://calendly.com/soapboxsuperapp', '_blank')}
            >
              <Play className="mr-2 w-5 h-5" />
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything Your Ministry Needs
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools designed for pastors and church administrators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-sage-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Member Management</h3>
              <p className="text-gray-600">
                Track membership, families, attendance, and spiritual journeys all in one place with comprehensive profiles.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Donation & Tithing</h3>
              <p className="text-gray-600">
                Manage tithes, offerings, and donations with detailed reporting, tax receipts, and online giving portals.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Planning</h3>
              <p className="text-gray-600">
                Schedule services, Bible studies, and special events with automated reminders and RSVP tracking.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Communications</h3>
              <p className="text-gray-600">
                Send emails, SMS, and push notifications to keep your congregation connected and informed.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Volunteer Ministry</h3>
              <p className="text-gray-600">
                Coordinate volunteers, track service hours, and manage ministry teams with scheduling tools.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Discipleship Tracking</h3>
              <p className="text-gray-600">
                Monitor spiritual growth journeys, Bible studies, and mentorship programs across your congregation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Trusted by Churches Worldwide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-sage-700 mb-2">10,000+</div>
              <div className="text-gray-600">Churches Using SoapBox</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-sage-700 mb-2">2M+</div>
              <div className="text-gray-600">Members Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-sage-700 mb-2">$50M+</div>
              <div className="text-gray-600">Donations Tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Church Leaders Say
            </h2>
            <p className="text-xl text-gray-600">
              Hear from pastors and administrators who transformed their ministry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
              <p className="text-gray-700 mb-6 italic">
                "SoapBox has transformed how we shepherd our growing congregation. The pastoral care tracking alone has strengthened our ministry tremendously."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sage-700 rounded-full flex items-center justify-center text-white font-semibold">
                  MJ
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Pastor Michael Johnson</div>
                  <div className="text-sm text-gray-500">Grace Community Church</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
              <p className="text-gray-700 mb-6 italic">
                "Finally, a system built for the church, not adapted from secular software. Our 200+ volunteers love how easy it is to serve and coordinate."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sage-700 rounded-full flex items-center justify-center text-white font-semibold">
                  SW
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Williams</div>
                  <div className="text-sm text-gray-500">Riverside Fellowship</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
              <p className="text-gray-700 mb-6 italic">
                "The discipleship tracking helps us see where each member is in their faith journey. It's like having a digital shepherd's staff."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sage-700 rounded-full flex items-center justify-center text-white font-semibold">
                  DC
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Pastor David Chen</div>
                  <div className="text-sm text-gray-500">New Life Church</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-sage-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Church Management?
          </h2>
          <p className="text-xl text-sage-100 mb-8">
            Join thousands of churches who are shepherding their congregations more effectively with SoapBox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-sage-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                Get Started Free
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-sage-700 px-8 py-4 text-lg"
              onClick={() => window.open('https://calendly.com/soapboxsuperapp', '_blank')}
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Logo size="sm" variant="light" className="mb-4" />
              <p className="text-gray-400 mb-4">
                The complete church management platform powered by SoapBox Super App.
                Helping churches shepherd their congregations with excellence.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Schedule Demo</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} SoapBox Super App. Built with faith and community in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
