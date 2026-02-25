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
  Check,
  Star,
  Shield,
  Sparkles,
  BarChart3,
  UserPlus,
  Bell,
  FileText,
  Clock,
  Globe,
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

const PrayingHandsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C11.5 2 11 2.19 10.59 2.59L7.29 5.88C6.91 6.26 6.53 6.53 6.23 6.71C6.08 6.8 5.96 6.86 5.88 6.9C5.84 6.92 5.82 6.93 5.81 6.94L5.79 6.95L5.8 6.94L5.62 7L5 7.19V8.31L5.83 8.05L6.07 7.97C6.13 7.94 6.23 7.9 6.38 7.83C6.66 7.68 7.04 7.46 7.47 7.12L10 4.59V10.59L6 14.59V21H8V15.41L11 12.41V21H13V12.41L16 15.41V21H18V14.59L14 10.59V4.59L16.53 7.12C16.96 7.46 17.34 7.68 17.62 7.83C17.77 7.9 17.87 7.94 17.93 7.97L18.17 8.05L19 8.31V7.19L18.38 7L18.2 6.94L18.19 6.95L18.17 6.94C18.16 6.93 18.14 6.92 18.12 6.9C18.04 6.86 17.92 6.8 17.77 6.71C17.47 6.53 17.09 6.26 16.71 5.88L13.41 2.59C13 2.19 12.5 2 12 2Z"/>
  </svg>
);

// Hero images for gallery
const heroImages = [
  { src: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80", alt: "Church worship service" },
  { src: "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=800&q=80", alt: "Pastor preaching" },
  { src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80", alt: "Small group meeting" },
  { src: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80", alt: "Bible study" },
  { src: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=80", alt: "Church community" },
];

// Community images for bento grid
const communityImages = [
  { src: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=600&q=80", title: "Bible Study", subtitle: "Growing in Scripture together", large: true },
  { src: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80", title: "Worship", subtitle: "United in faith", large: true },
  { src: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80", title: "Giving", small: true },
  { src: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=600&q=80", title: "Volunteers", subtitle: "Serving together", large: true },
  { src: "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=600&q=80", title: "Service", small: true },
  { src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80", title: "Fellowship", subtitle: "Building community", large: true },
  { src: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=600&q=80", title: "Youth", small: true },
  { src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80", title: "Outreach", small: true },
];

export default function Landing() {
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
              <Link href="/about" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">About</Link>
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
              <Link href="/login">
                <Button className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white shadow-lg shadow-purple-500/25">
                  Get Started
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-purple-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-6 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>"The #1 Church Management Platform"</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-gray-900">The Complete</span>
                <br />
                <span className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent">Church Admin</span>
                <br />
                <span className="text-gray-900">Platform</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl">
                Professional church management software with member tracking, donation processing, event scheduling, and volunteer coordination. Everything your ministry needs in one place.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Member Management</span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Donation Tracking</span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">10+ Features</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Link href="/login">
                  <Button size="lg" className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white shadow-lg shadow-purple-500/25 px-8">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Started Free
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8"
                  onClick={() => window.open('https://calendly.com/soapboxsuperapp', '_blank')}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule Demo
                </Button>
              </div>

              {/* Free Note */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Check className="w-4 h-4 text-green-500" />
                <span>Included free with SoapBox subscription</span>
              </div>
            </div>

            {/* Right - Image Gallery */}
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 row-span-2">
                  <img
                    src={heroImages[0].src}
                    alt={heroImages[0].alt}
                    className="w-full h-80 object-cover rounded-2xl shadow-2xl"
                  />
                </div>
                <div>
                  <img
                    src={heroImages[1].src}
                    alt={heroImages[1].alt}
                    className="w-full h-[152px] object-cover rounded-xl shadow-lg"
                  />
                </div>
                <div>
                  <img
                    src={heroImages[2].src}
                    alt={heroImages[2].alt}
                    className="w-full h-[152px] object-cover rounded-xl shadow-lg"
                  />
                </div>
                <div className="col-span-2">
                  <img
                    src={heroImages[3].src}
                    alt={heroImages[3].alt}
                    className="w-full h-32 object-cover rounded-xl shadow-lg"
                  />
                </div>
                <div>
                  <img
                    src={heroImages[4].src}
                    alt={heroImages[4].alt}
                    className="w-full h-32 object-cover rounded-xl shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4 text-sm font-medium">
              <CrossIcon className="w-4 h-4" />
              <span>Why Church Admin</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Sets Us Apart
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Church Admin gives your ministry tools that other platforms charge thousands for — included with your SoapBox subscription.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                Included Free
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Member Database</h3>
              <p className="text-gray-600">
                Track every member with detailed profiles, family connections, attendance history, and spiritual journey milestones. No per-member fees.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                No Platform Fees
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Donation Processing</h3>
              <p className="text-gray-600">
                Accept tithes and offerings with zero platform markup. Recurring giving, fund designation, and detailed financial reports. Only standard Stripe fees apply.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                20+ Features
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Full Ministry Suite</h3>
              <p className="text-gray-600">
                Events, volunteers, communications, reports, small groups, check-in, and more — everything a modern church needs to thrive digitally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Up & Running in Minutes Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4 text-sm font-medium">
              <Clock className="w-4 h-4" />
              <span>Simple Setup</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Up & Running in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get your church management system live in minutes
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Step 1 */}
            <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-3 -left-3 text-6xl font-bold text-purple-100">01</div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                  <UserPlus className="w-7 h-7 text-white" />
                </div>
                <div className="inline-block bg-purple-100 text-purple-700 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Create Account</h3>
                <p className="text-gray-600">
                  Sign up free with your SoapBox account. No credit card needed.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-3 -left-3 text-6xl font-bold text-purple-100">02</div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                  <ChurchIcon className="w-7 h-7 text-white" />
                </div>
                <div className="inline-block bg-purple-100 text-purple-700 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Set Up Your Church</h3>
                <p className="text-gray-600">
                  Configure your church profile, add staff, and customize settings.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-3 -left-3 text-6xl font-bold text-purple-100">03</div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div className="inline-block bg-purple-100 text-purple-700 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Start Managing</h3>
                <p className="text-gray-600">
                  Import members, track giving, and coordinate your ministry.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white shadow-lg shadow-purple-500/25 px-8">
                Get Started Free
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-3">Takes less than 2 minutes</p>
          </div>
        </div>
      </section>

      {/* Community in Action - Bento Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4 text-sm font-medium">
              <Heart className="w-4 h-4" />
              <span>Community in Action</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              See Churches Thrive with Church Admin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From small groups to volunteer teams, Church Admin brings every part of your ministry together.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {communityImages.map((image, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-2xl group ${
                  image.large ? 'col-span-1 row-span-1 md:row-span-1' : ''
                } ${index === 0 || index === 3 ? 'md:col-span-2' : ''}`}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                    image.large || index === 0 || index === 3 ? 'h-64' : 'h-40'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-semibold">{image.title}</p>
                  {image.subtitle && <p className="text-sm text-white/80">{image.subtitle}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Ministry Hub Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4 text-sm font-medium">
              <Globe className="w-4 h-4" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Your Complete Church Management Hub
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Members, donations, events, volunteers, communications, and more — all in one platform built for churches.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Member Directory</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive profiles with family links, attendance, and spiritual milestones.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Donation & Giving</h3>
              <p className="text-gray-600 text-sm">
                Online giving, recurring donations, fund tracking, and tax receipts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Events & RSVPs</h3>
              <p className="text-gray-600 text-sm">
                Schedule services, manage RSVPs, and coordinate ministry calendars.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Volunteer Management</h3>
              <p className="text-gray-600 text-sm">
                Recruit, schedule, and track volunteer service across all ministries.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Communications</h3>
              <p className="text-gray-600 text-sm">
                Email, SMS, and push notifications to keep your congregation connected.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Reports & Analytics</h3>
              <p className="text-gray-600 text-sm">
                Detailed insights on attendance, giving trends, and ministry growth.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/features">
              <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8">
                View All 20+ Features
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Churches Choose Us Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image with Quote */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=800&q=80"
                alt="Church leadership"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm font-medium text-gray-600 ml-2">4.8/5</span>
                </div>
                <p className="text-gray-700 italic">
                  "Church Admin transformed how we shepherd our growing congregation."
                </p>
              </div>
            </div>

            {/* Right - Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4 text-sm font-medium">
                <Shield className="w-4 h-4" />
                <span>Trusted Platform</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Why Churches Choose Us
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built specifically for faith communities with the features that matter most.
              </p>

              <div className="space-y-4">
                {/* Feature 1 */}
                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Secure & Private</h3>
                      <p className="text-gray-600 text-sm">
                        Your church's data is treated with sacred care — secure, private, and always under your control.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 2 - Most Loved */}
                <div className="relative bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-200">
                  <div className="absolute -top-3 right-4 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Loved
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Easy to Use</h3>
                      <p className="text-gray-600 text-sm">
                        Intuitive design that works for all ages and technical abilities. Get started in minutes, not hours.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-lg flex items-center justify-center flex-shrink-0">
                      <CrossIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Built for Faith</h3>
                      <p className="text-gray-600 text-sm">
                        Every feature is designed with faith communities in mind, supporting your unique needs and values.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Decorative quotes */}
        <div className="absolute top-10 left-10 text-9xl text-purple-100 font-serif">"</div>
        <div className="absolute bottom-10 right-10 text-9xl text-purple-100 font-serif">"</div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4 text-sm font-medium">
              <Star className="w-4 h-4" />
              <span>Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Churches Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from pastors and ministry leaders who have transformed their communities
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-4xl text-purple-200 font-serif mb-4">"</div>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "Church Admin has completely transformed how our congregation connects. The member tracking and pastoral care features have strengthened our ministry tremendously."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-full flex items-center justify-center text-white font-bold">
                  PM
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Pastor Michael T.</div>
                  <div className="text-sm text-gray-500">Grace Community Church, Texas</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 - Featured */}
            <div className="relative bg-white p-8 rounded-2xl border border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white text-xs font-bold px-4 py-1 rounded-full">
                Featured
              </div>
              <div className="text-4xl text-purple-200 font-serif mb-4">"</div>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "The volunteer management and event scheduling features saved us countless hours each week. Our small groups have grown by 40% since implementing Church Admin."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-full flex items-center justify-center text-white font-bold">
                  SJ
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah J.</div>
                  <div className="text-sm text-gray-500">Ministry Director, Harvest Fellowship, FL</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-4xl text-purple-200 font-serif mb-4">"</div>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "The donation tracking helps us see exactly where our church finances stand. The reports are comprehensive and make year-end giving statements a breeze."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-full flex items-center justify-center text-white font-bold">
                  DR
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Rev. David R.</div>
                  <div className="text-sm text-gray-500">New Life Church, California</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Included with SoapBox Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Part of SoapBox</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Included with Your SoapBox Subscription
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Church Admin is included at no extra cost with every SoapBox plan. Get complete church management alongside prayer walls, devotionals, and community features.
              </p>

              {/* Feature List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Complete church management suite</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Prayer wall & devotional tools</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Community engagement features</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">10+ AI ministry tools</span>
                </div>
              </div>

              <a href="https://soapboxsuperapp.com/pricing" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white shadow-lg shadow-purple-500/25">
                  View SoapBox Plans
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </a>
            </div>

            {/* Right - AI Tools Grid */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Powered by SoapBox
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <PrayingHandsIcon className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-sm text-gray-900">Prayer Wall</h4>
                  <p className="text-xs text-gray-500">Share & pray together</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <BookOpen className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-sm text-gray-900">Bible Study</h4>
                  <p className="text-xs text-gray-500">S.O.A.P. journaling</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <Bell className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-sm text-gray-900">Notifications</h4>
                  <p className="text-xs text-gray-500">Keep members engaged</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <FileText className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-sm text-gray-900">Devotionals</h4>
                  <p className="text-xs text-gray-500">Daily inspiration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] via-[#5B21B6] to-[#2563EB]" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Church Management?
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
            Join thousands of churches worldwide using Church Admin to connect, grow, and serve.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Link href="/login">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold shadow-xl">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Free Today
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-10 py-4 text-lg"
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
                Empowering churches with innovative management tools that bring congregations together and transform ministry.
              </p>
              {/* Social Links */}
              <div className="flex gap-4 mt-6">
                <a href="https://facebook.com/soapboxsuperapp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://twitter.com/soapboxsuperapp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://linkedin.com/company/soapboxsuperapp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>

            {/* Features Column */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">All Features</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Member Management</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Donation Tracking</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Event Planning</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Volunteer Hub</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><a href="https://soapboxsuperapp.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">SoapBox App</a></li>
                <li><a href="https://soapboxsuperapp.com/help-docs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Help Center</a></li>
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

          {/* Bottom */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} SoapBox Super App. All rights reserved. Built with faith and technology.
              </p>
              <p className="text-gray-500 text-xs">
                Transforming communities through digital connection
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
