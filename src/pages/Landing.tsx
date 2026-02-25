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
  ChevronRight,
  Play,
  Check,
  Star,
  MessageCircle,
} from "lucide-react";

// Custom Spiritual Icons
const CrossIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 2V8H4V10H10V22H14V10H20V8H14V2H10Z"/>
  </svg>
);

const DoveIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C9.8 2 8 3.8 8 6C8 7.1 8.4 8.1 9 8.9C8.4 9.7 8 10.9 8 12C8 14.2 9.8 16 12 16C14.2 16 16 14.2 16 12C16 10.9 15.6 9.7 15 8.9C15.6 8.1 16 7.1 16 6C16 3.8 14.2 2 12 2ZM12 4C13.1 4 14 4.9 14 6C14 7.1 13.1 8 12 8C10.9 8 10 7.1 10 6C10 4.9 10.9 4 12 4Z"/>
    <path d="M12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10Z"/>
    <path d="M6 12C6 10.3 6.7 8.8 7.8 7.8L6.4 6.4C4.9 7.9 4 10.3 4 12.5C4 17.2 7.8 21 12.5 21C14.7 21 17.1 20.1 18.6 18.6L17.2 17.2C16.2 18.3 14.7 19 13 19H12C8.7 19 6 16.3 6 13V12Z"/>
  </svg>
);

const ChurchIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 12.22V21H6V12.22L4 13.5V15L6 13.78V21H4V23H20V21H18V13.78L20 15V13.5L18 12.22ZM8 21V15H10V21H8ZM14 21V15H16V21H14ZM11 7V4H9V7H7V9H9V11H7L12 16L17 11H15V9H17V7H15V4H13V7H11ZM12 2L10 4H14L12 2Z"/>
  </svg>
);

const PrayingHandsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C11.5 2 11 2.19 10.59 2.59L7.29 5.88C6.91 6.26 6.53 6.53 6.23 6.71C6.08 6.8 5.96 6.86 5.88 6.9C5.84 6.92 5.82 6.93 5.81 6.94L5.79 6.95L5.8 6.94L5.62 7L5 7.19V8.31L5.83 8.05L6.07 7.97C6.13 7.94 6.23 7.9 6.38 7.83C6.66 7.68 7.04 7.46 7.47 7.12L10 4.59V10.59L6 14.59V21H8V15.41L11 12.41V21H13V12.41L16 15.41V21H18V14.59L14 10.59V4.59L16.53 7.12C16.96 7.46 17.34 7.68 17.62 7.83C17.77 7.9 17.87 7.94 17.93 7.97L18.17 8.05L19 8.31V7.19L18.38 7L18.2 6.94L18.19 6.95L18.17 6.94C18.16 6.93 18.14 6.92 18.12 6.9C18.04 6.86 17.92 6.8 17.77 6.71C17.47 6.53 17.09 6.26 16.71 5.88L13.41 2.59C13 2.19 12.5 2 12 2Z"/>
  </svg>
);

// Hero background image
const heroImage = "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=80";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="sm" />

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Features</Link>
              <Link href="/about" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Contact</Link>
              <a href="https://soapboxsuperapp.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">SoapBox</a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-purple-600"
                >
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" loading="eager" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/80" />
          <div className="absolute inset-0 bg-purple-900/20" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white rounded-full px-5 py-2.5 mb-8 text-sm font-medium border border-white/20">
            <ChurchIcon className="w-4 h-4" />
            <span className="text-xs tracking-wide">CHURCH MANAGEMENT PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-white">Manage Your Church</span>
            <br />
            <span className="text-purple-300 font-extrabold">With Confidence</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 font-medium max-w-3xl mx-auto mb-12">
            The complete church management platform that helps pastors and ministry leaders
            shepherd their congregations, track giving, and nurture spiritual growth.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Start Free Trial
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 px-8 py-4 text-lg"
              onClick={() => window.open('https://calendly.com/soapboxsuperapp', '_blank')}
            >
              <Play className="mr-2 w-5 h-5" />
              Schedule Demo
            </Button>
          </div>

          {/* Stats row — glass white */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-5 text-center border border-white/10 hover:bg-white/20 transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">10,000+</div>
              <div className="text-gray-300 text-xs mt-1 font-medium">Churches</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-5 text-center border border-white/10 hover:bg-white/20 transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">2M+</div>
              <div className="text-gray-300 text-xs mt-1 font-medium">Members</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-5 text-center border border-white/10 hover:bg-white/20 transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">$50M+</div>
              <div className="text-gray-300 text-xs mt-1 font-medium">Tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-purple-600 mb-2">POWERFUL FEATURES</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything Your Ministry Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed for pastors and church administrators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
              <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Member Management</h3>
              <p className="text-gray-600">
                Track membership, families, attendance, and spiritual journeys all in one place with comprehensive profiles.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
              <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Donation & Tithing</h3>
              <p className="text-gray-600">
                Manage tithes, offerings, and donations with detailed reporting, tax receipts, and online giving portals.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
              <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Planning</h3>
              <p className="text-gray-600">
                Schedule services, Bible studies, and special events with automated reminders and RSVP tracking.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
              <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Communications</h3>
              <p className="text-gray-600">
                Send emails, SMS, and push notifications to keep your congregation connected and informed.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
              <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Volunteer Ministry</h3>
              <p className="text-gray-600">
                Coordinate volunteers, track service hours, and manage ministry teams with scheduling tools.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
              <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Discipleship Tracking</h3>
              <p className="text-gray-600">
                Monitor spiritual growth journeys, Bible studies, and mentorship programs across your congregation.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/features">
              <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3">
                View All Features
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Integrated with SoapBox Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-2">PART OF THE ECOSYSTEM</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Fully Integrated with SoapBox Super App
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Church Admin is included with your SoapBox subscription—no extra cost.
                Seamlessly connect your church management with the complete faith-based platform for
                community engagement, spiritual growth, and digital ministry.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">One Platform, Complete Ministry</h3>
                    <p className="text-gray-600 text-sm">Access church management alongside prayer walls, devotionals, and community features.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Included in Your Subscription</h3>
                    <p className="text-gray-600 text-sm">No additional fees—Church Admin comes with every SoapBox plan.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Seamless Member Experience</h3>
                    <p className="text-gray-600 text-sm">Your congregation uses SoapBox app while you manage everything from Church Admin.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <DoveIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">SoapBox Super App</h3>
                  <p className="text-gray-600">Faith-Based Digital Ministry Platform</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <MessageCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Community</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <PrayingHandsIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Prayer Wall</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <BookOpen className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Devotionals</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <ChurchIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Church Admin</p>
                </div>
              </div>

              <a href="https://soapboxsuperapp.com" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white">
                  Learn More About SoapBox
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-purple-600 mb-2">TESTIMONIALS</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Church Leaders Say
            </h2>
            <p className="text-xl text-gray-600">
              Hear from pastors and administrators who transformed their ministry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-all duration-300">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "SoapBox has transformed how we shepherd our growing congregation. The pastoral care tracking alone has strengthened our ministry tremendously."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-full flex items-center justify-center text-white font-bold">
                  MJ
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Pastor Michael Johnson</div>
                  <div className="text-sm text-gray-500">Grace Community Church</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-all duration-300">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Finally, a system built for the church, not adapted from secular software. Our 200+ volunteers love how easy it is to serve and coordinate."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-full flex items-center justify-center text-white font-bold">
                  SW
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Williams</div>
                  <div className="text-sm text-gray-500">Riverside Fellowship</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-all duration-300">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "The discipleship tracking helps us see where each member is in their faith journey. It's like having a digital shepherd's staff."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-full flex items-center justify-center text-white font-bold">
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
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] via-[#5B21B6] to-[#2563EB]" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CrossIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Church Management?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of churches who are shepherding their congregations more effectively with SoapBox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Get Started Free
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-transparent text-white border-2 border-white/80 hover:bg-white/10 px-10 py-4 text-lg"
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
              <Logo size="sm" />
              <p className="text-gray-400 mt-4 mb-4">
                The complete church management platform powered by SoapBox Super App.
                Helping churches shepherd their congregations with excellence.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><a href="https://soapboxsuperapp.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">SoapBox App</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
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
