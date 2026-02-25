import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  Heart,
  Users,
  Shield,
  BookOpen,
  ChevronRight,
  Star,
  Lock,
  Linkedin,
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

// Hero background image
const heroImage = "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1920&q=80";
const volunteerImage = "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80";
const pastorImage = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80";

export default function AboutUs() {
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
              <Link href="/about" className="text-purple-600 font-semibold">About</Link>
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

      {/* Hero — Full-Bleed Image with Text Overlay */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" loading="eager" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/80" />
          <div className="absolute inset-0 bg-purple-900/20" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white rounded-full px-5 py-2.5 mb-8 text-sm font-medium border border-white/20">
            <Heart className="w-4 h-4" />
            <span className="text-xs tracking-wide">OUR STORY</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-white">About SoapBox</span>
            <br />
            <span className="text-purple-300 font-extrabold">Church Admin</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 font-medium max-w-2xl mx-auto mb-12">
            Part of the SoapBox Super App — The Complete Faith-Based Digital Ministry Platform
          </p>

          {/* Stats row — glass white */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-5 text-center border border-white/10 hover:bg-white/20 transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">2023</div>
              <div className="text-gray-300 text-xs mt-1 font-medium">Founded</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-5 text-center border border-white/10 hover:bg-white/20 transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">100%</div>
              <div className="text-gray-300 text-xs mt-1 font-medium">Faith-Focused</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-5 text-center border border-white/10 hover:bg-white/20 transition-all duration-300">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">1000+</div>
              <div className="text-gray-300 text-xs mt-1 font-medium">Churches</div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-14">
            <div className="flex flex-col items-center gap-2 text-white/60">
              <span className="text-xs font-medium tracking-wider uppercase">Discover Our Story</span>
              <ChevronRight className="w-5 h-5 rotate-90 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">

        {/* Mission Section */}
        <section className="mb-12 sm:mb-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                Our Mission
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                To build technology for the Church that strengthens relationships, enhances spiritual formation, and supports meaningful ministry in every season.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CrossIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Faith-First Technology</h3>
                    <p className="text-gray-600">Built exclusively for churches, not adapted from secular platforms.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Community Connection</h3>
                    <p className="text-gray-600">Strengthening relationships and building deeper spiritual bonds.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Safe & Secure</h3>
                    <p className="text-gray-600">Privacy-first design with no data reselling or ad tracking.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 lg:mt-0 relative">
              {/* Volunteer Image with overlaid card */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={volunteerImage}
                  alt="Church volunteers serving together"
                  className="w-full h-[400px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent flex items-end">
                  <div className="p-6 w-full bg-white/95 backdrop-blur-sm rounded-t-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Complete Church Management Platform
                    </h3>
                    <p className="text-sm text-gray-600">
                      Church Admin is part of the SoapBox Super App—the all-in-one platform designed to help churches grow, connect, and thrive in today's digital world.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-purple-600 mb-2">DIGITAL TOOLS FOR MODERN MINISTRY</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 px-4">
              What We Do
            </h2>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 sm:p-8 lg:p-12 mb-8">
            <p className="text-base sm:text-lg text-gray-600 text-center max-w-4xl mx-auto mb-12">
              SoapBox Church Admin is more than a church management system. It's a complete administrative platform that helps churches manage members, track giving, coordinate volunteers, and nurture spiritual growth.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="group bg-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-gray-200 hover:border-purple-200">
                <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold mb-3">Member Management</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Track membership, families, and comprehensive profiles for your congregation.</p>
              </div>

              <div className="group bg-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-gray-200 hover:border-purple-200">
                <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                  <ChurchIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold mb-3">Donation Tracking</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Manage tithes, offerings, and donations with detailed financial reporting.</p>
              </div>

              <div className="group bg-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-gray-200 hover:border-purple-200">
                <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold mb-3">Discipleship Tracking</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Monitor spiritual growth journeys, Bible studies, and mentorship programs.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Who We Serve */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 sm:mb-12 px-4">
            Who We Serve
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-6">
                <ChurchIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Pastors</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Senior leaders seeking comprehensive oversight of their ministry and congregation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Church Admins</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Administrative staff managing daily operations, events, and communications.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ministry Leaders</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Small group leaders, elders, and ministry coordinators overseeing teams.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Church Sizes</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Faith communities from small groups to megachurches of every size.
              </p>
            </div>
          </div>
        </section>

        {/* Meet Our Team */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-sm font-medium text-purple-600 mb-2">LEADERSHIP</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 px-4">
              Meet Our Team
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Passionate believers combining faith and technology to serve the Church.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Founder & CEO */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow border border-gray-200">
              <div className="w-24 h-24 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">AS</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Alan Safahi</h3>
              <p className="text-purple-600 font-medium mb-3">Founder & CEO</p>
              <p className="text-gray-600 text-sm">
                Serial entrepreneur with 25+ years in fintech and software. Passionate about leveraging technology to strengthen faith communities.
              </p>
              <div className="flex justify-center gap-3 mt-4">
                <a href="https://www.linkedin.com/in/alansafahi" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-purple-100 transition-colors">
                  <Linkedin className="w-4 h-4 text-gray-600" />
                </a>
              </div>
            </div>

            {/* Tech Leadership */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow border border-gray-200">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">TL</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Tech Leadership</h3>
              <p className="text-purple-600 font-medium mb-3">Engineering Team</p>
              <p className="text-gray-600 text-sm">
                World-class engineering team with experience at leading tech companies. Building secure, scalable solutions for modern ministry.
              </p>
            </div>

            {/* Ministry Advisors */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow border border-gray-200">
              <div className="w-24 h-24 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-4">
                <CrossIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Ministry Advisors</h3>
              <p className="text-purple-600 font-medium mb-3">Pastoral Guidance</p>
              <p className="text-gray-600 text-sm">
                Network of pastors and church administrators who guide our product development to ensure we truly serve the Church.
              </p>
            </div>
          </div>

          <div className="mt-12 bg-purple-50 rounded-xl p-6 sm:p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Join Our Mission</h3>
            <p className="text-gray-600 mb-4">
              We're always looking for talented believers who want to use their skills to serve the Church.
            </p>
            <a href="mailto:careers@soapboxsuperapp.com" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium">
              View Open Positions
              <ChevronRight className="w-4 h-4 ml-1" />
            </a>
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-12 sm:mb-16">
          <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 sm:p-8 lg:p-12 relative overflow-hidden">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 px-4">
              Our Story
            </h2>

            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-5 gap-8 items-center mb-8">
                <div className="lg:col-span-3">
                  <p className="text-base sm:text-lg text-gray-700 mb-6">
                    Church Admin began as part of the SoapBox Super App vision: What if the Church had a tech platform built exclusively for its mission—not adapted from secular tools?
                  </p>
                  <p className="text-base sm:text-lg text-gray-700">
                    Founded by believers with backgrounds in software engineering, ministry, and nonprofit leadership, SoapBox was created to serve faith, not profit. Church Admin is included with every SoapBox subscription at no extra cost.
                  </p>
                </div>
                <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-xl h-64">
                  <img src={pastorImage} alt="Pastor leading worship" className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic text-base sm:text-lg">
                  "SoapBox Church Admin has brought our administrative team together in ways we never imagined. It's like having a digital command center for our ministry."
                </p>
                <div className="font-semibold text-gray-900">Pastor Michael J.</div>
                <div className="text-gray-600">Texas</div>
              </div>
            </div>
          </div>
        </section>

        {/* Safe & Secure Features */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 px-4">
              Faith-Based Technology That's Safe, Secure & Spirit-Led
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Church Admin is built for churches—prioritizing your privacy, values, and faith journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy-First</h3>
              <p className="text-gray-600 text-sm">We protect your church's data with faith-first privacy—no ad tracking, no data resale, ever.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CrossIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Faith-Focused</h3>
              <p className="text-gray-600 text-sm">Designed with spiritual discernment—technology supports your mission without replacing it.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ChurchIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Church-Built</h3>
              <p className="text-gray-600 text-sm">Purpose-built church technology—not a generic business platform in disguise.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Always Available</h3>
              <p className="text-gray-600 text-sm">Access your church data anywhere with cloud-based technology and dedicated support.</p>
            </div>
          </div>
        </section>

        {/* Join the Movement */}
        <section className="relative bg-gradient-to-br from-[#7C3AED] via-[#5B21B6] to-[#2563EB] rounded-2xl p-6 sm:p-8 lg:p-12 text-center text-white overflow-hidden">
          {/* Background image overlay */}
          <div className="absolute inset-0 z-0">
            <img src={heroImage} alt="" className="w-full h-full object-cover opacity-10" loading="lazy" />
          </div>
          <div className="relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <DoveIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 px-4">
            Transform Your Church Management
          </h2>
          <p className="text-base sm:text-lg text-purple-100 mb-8 max-w-2xl mx-auto px-4">
            Ready to streamline your church administration? Experience where faith meets functionality.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px] shadow-xl"
              >
                Start Free Today
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-transparent text-white border-2 border-white/80 hover:bg-white/10 px-12 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px]"
              onClick={() => window.open('https://www.calendly.com/soapboxsuperapp', '_blank')}
            >
              Schedule Demo
            </Button>
          </div>
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
