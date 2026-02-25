import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  Heart,
  Users,
  ChevronRight,
  Star,
  Globe,
  Sparkles,
  Check,
  Calendar,
  Shield,
  Target,
  Lightbulb,
  Linkedin,
} from "lucide-react";

// Custom Spiritual Icons
const CrossIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 2V8H4V10H10V22H14V10H20V8H14V2H10Z"/>
  </svg>
);

const ChurchIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 12.22V21H6V12.22L4 13.5V15L6 13.78V21H4V23H20V21H18V13.78L20 15V13.5L18 12.22ZM8 21V15H10V21H8ZM14 21V15H16V21H14ZM11 7V4H9V7H7V9H9V11H7L12 16L17 11H15V9H17V7H15V4H13V7H11ZM12 2L10 4H14L12 2Z"/>
  </svg>
);

const DoveIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C9.8 2 8 3.8 8 6C8 7.1 8.4 8.1 9 8.9C8.4 9.7 8 10.9 8 12C8 14.2 9.8 16 12 16C14.2 16 16 14.2 16 12C16 10.9 15.6 9.7 15 8.9C15.6 8.1 16 7.1 16 6C16 3.8 14.2 2 12 2ZM12 4C13.1 4 14 4.9 14 6C14 7.1 13.1 8 12 8C10.9 8 10 7.1 10 6C10 4.9 10.9 4 12 4Z"/>
    <path d="M12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10Z"/>
    <path d="M6 12C6 10.3 6.7 8.8 7.8 7.8L6.4 6.4C4.9 7.9 4 10.3 4 12.5C4 17.2 7.8 21 12.5 21C14.7 21 17.1 20.1 18.6 18.6L17.2 17.2C16.2 18.3 14.7 19 13 19H12C8.7 19 6 16.3 6 13V12Z"/>
  </svg>
);

const values = [
  {
    icon: Heart,
    title: "Faith-Centered",
    description: "Every feature is designed with the mission of the church in mind, supporting your unique ministry needs.",
  },
  {
    icon: Shield,
    title: "Security First",
    description: "Your congregation's data is treated with sacred care — secure, encrypted, and always under your control.",
  },
  {
    icon: Target,
    title: "Purpose-Built",
    description: "Not adapted corporate software. Church Admin is built from the ground up for ministry.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Continually improving with new features based on feedback from real church leaders like you.",
  },
];

const stats = [
  { value: "20+", label: "Features" },
  { value: "24/7", label: "Support" },
  { value: "Free", label: "With SoapBox" },
  { value: "100%", label: "Cloud-Based" },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <Logo size="sm" />
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-purple-600 font-semibold">About</Link>
              <Link href="/features" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Features</Link>
              <Link href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Contact</Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="hidden sm:flex border-purple-200 text-purple-600 hover:bg-purple-50"
                onClick={() => window.open('https://calendly.com/soapboxsuperapp', '_blank')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Demo
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-purple-600">
                  Sign In
                </Button>
              </Link>
              <a href="https://soapboxsuperapp.com/quick-signup" target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white shadow-lg shadow-purple-500/25">
                  Get Started
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-purple-50 via-white to-white">
        <div className="max-w-4xl mx-auto relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-6 text-sm font-medium">
            <DoveIcon className="w-4 h-4" />
            <span>Our Story</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gray-900">Built for the</span>
            <br />
            <span className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent">Local Church</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-medium max-w-2xl mx-auto mb-10">
            Empowering pastors and ministry leaders with tools designed specifically for shepherding congregations in the digital age.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl px-4 py-5 text-center border border-gray-100 shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-500 text-xs mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80"
                alt="Church community"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center shadow-xl">
                <div className="text-center text-white">
                  <CrossIcon className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm font-medium">Faith-First<br />Technology</p>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4 text-sm font-medium">
                <Heart className="w-4 h-4" />
                <span>Our Mission</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Helping Churches Thrive in the Digital Age
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Church Admin was born from a simple observation: churches deserve tools built specifically for their unique needs, not adapted corporate software that doesn't understand ministry.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We believe technology should serve the mission of the church — to shepherd, connect, and grow congregations. Every feature we build is designed with pastors and ministry leaders in mind.
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
                  <Check className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-700">Ministry-Focused</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
                  <Check className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-700">Easy to Use</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
                  <Check className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-700">Always Improving</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4 text-sm font-medium">
              <Star className="w-4 h-4" />
              <span>Our Values</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What We Believe In
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do at Church Admin
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4 text-sm font-medium">
              <Users className="w-4 h-4" />
              <span>Who We Serve</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for Every Church
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From small community churches to large multi-campus ministries
            </p>
          </div>

          {/* Church Types Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100">
              <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
                <ChurchIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Small Churches</h3>
              <p className="text-gray-600">
                Perfect for churches under 100 members looking to organize and grow their ministry with professional tools.
              </p>
            </div>

            <div className="text-center bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100">
              <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Growing Churches</h3>
              <p className="text-gray-600">
                Scalable features that grow with your congregation, from hundreds to thousands of members.
              </p>
            </div>

            <div className="text-center bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100">
              <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Campus</h3>
              <p className="text-gray-600">
                Enterprise-grade tools for churches with multiple locations and complex organizational needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4 text-sm font-medium">
              <Users className="w-4 h-4" />
              <span>Leadership</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Passionate believers combining faith and technology to serve the Church
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Founder */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">AS</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Alan Safahi</h3>
              <p className="text-purple-600 font-medium mb-4">Founder & CEO</p>
              <p className="text-gray-600 text-sm mb-4">
                Serial entrepreneur with 25+ years in fintech. Passionate about leveraging technology to strengthen faith communities.
              </p>
              <a
                href="https://linkedin.com/in/alansafahi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-purple-100 transition-colors"
              >
                <Linkedin className="w-5 h-5 text-gray-600" />
              </a>
            </div>

            {/* Engineering */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">TL</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Tech Leadership</h3>
              <p className="text-purple-600 font-medium mb-4">Engineering Team</p>
              <p className="text-gray-600 text-sm">
                World-class engineering team with experience at leading tech companies. Building secure, scalable solutions for modern ministry.
              </p>
            </div>

            {/* Ministry Advisors */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-6">
                <CrossIcon className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Ministry Advisors</h3>
              <p className="text-purple-600 font-medium mb-4">Pastoral Guidance</p>
              <p className="text-gray-600 text-sm">
                Network of pastors and church administrators who guide our product development to ensure we truly serve the Church.
              </p>
            </div>
          </div>

          {/* Join CTA */}
          <div className="mt-12 bg-purple-50 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Join Our Mission</h3>
            <p className="text-gray-600 mb-4">
              We're always looking for talented believers who want to use their skills to serve the Church.
            </p>
            <a href="mailto:careers@soapboxsuperapp.com" className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium">
              View Open Positions
              <ChevronRight className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Part of SoapBox Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Part of SoapBox</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Powered by SoapBox Super App
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Church Admin is part of the SoapBox Super App ecosystem — the complete digital ministry platform for faith communities.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                While Church Admin provides powerful tools for pastors and administrators, SoapBox gives your congregation a place to connect, pray, and grow together.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Prayer walls for your congregation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Bible reading & S.O.A.P. journaling</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Community engagement tools</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">10+ AI ministry tools</span>
                </div>
              </div>

              <a href="https://soapboxsuperapp.com" target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white px-8 shadow-lg shadow-purple-500/25">
                  Learn More About SoapBox
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>

            {/* Right - Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=400&q=80"
                alt="Bible study"
                className="w-full h-48 object-cover rounded-xl shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=400&q=80"
                alt="Church community"
                className="w-full h-48 object-cover rounded-xl shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=400&q=80"
                alt="Pastor"
                className="w-full h-48 object-cover rounded-xl shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80"
                alt="Small group"
                className="w-full h-48 object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] via-[#5B21B6] to-[#2563EB]" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ChurchIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Ministry?
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Start using Church Admin today to shepherd your congregation with powerful tools.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <a href="https://soapboxsuperapp.com/quick-signup" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold shadow-xl"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </a>
            <Button
              size="lg"
              className="bg-transparent text-white border-2 border-white/80 hover:bg-white/10 px-10 py-4 text-lg"
              onClick={() => window.open('https://calendly.com/soapboxsuperapp', '_blank')}
            >
              Schedule Demo
            </Button>
          </div>

          {/* Benefit badges */}
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-2 text-white/90">
              <Check className="w-5 h-5 text-green-400" />
              <span>Free with SoapBox</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Check className="w-5 h-5 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Check className="w-5 h-5 text-green-400" />
              <span>Setup in minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo & Description */}
            <div className="col-span-1 md:col-span-1">
              <Logo size="sm" />
              <p className="text-gray-400 mt-4 text-sm leading-relaxed">
                The complete church management platform powered by SoapBox Super App.
                Helping churches shepherd their congregations with excellence.
              </p>
            </div>

            {/* Features Column */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">All Features</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Member Management</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Donation Tracking</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Event Planning</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><a href="https://soapboxsuperapp.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">SoapBox App</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} SoapBox Super App. Built with faith and community in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
