import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import {
  Mail,
  MessageCircle,
  Calendar,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Heart,
  BookOpen,
  Check,
  Send,
  Loader2,
  AlertCircle,
  ChevronRight,
  Sparkles,
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

const PrayingHandsIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C11.5 2 11 2.19 10.59 2.59L7.29 5.88C6.91 6.26 6.53 6.53 6.23 6.71C6.08 6.8 5.96 6.86 5.88 6.9C5.84 6.92 5.82 6.93 5.81 6.94L5.79 6.95L5.8 6.94L5.62 7L5 7.19V8.31L5.83 8.05L6.07 7.97C6.13 7.94 6.23 7.9 6.38 7.83C6.66 7.68 7.04 7.46 7.47 7.12L10 4.59V10.59L6 14.59V21H8V15.41L11 12.41V21H13V12.41L16 15.41V21H18V14.59L14 10.59V4.59L16.53 7.12C16.96 7.46 17.34 7.68 17.62 7.83C17.77 7.9 17.87 7.94 17.93 7.97L18.17 8.05L19 8.31V7.19L18.38 7L18.2 6.94L18.19 6.95L18.17 6.94C18.16 6.93 18.14 6.92 18.12 6.9C18.04 6.86 17.92 6.8 17.77 6.71C17.47 6.53 17.09 6.26 16.71 5.88L13.41 2.59C13 2.19 12.5 2 12 2Z"/>
  </svg>
);

// Hero background image
const heroImage = "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1920&q=80";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    isChurchLeader: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: "", email: "", message: "", isChurchLeader: false });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

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
              <Link href="/contact" className="text-purple-600 font-semibold">Contact</Link>
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
      <section className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-50" />

        <div className="max-w-6xl mx-auto relative z-10 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left — Image */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img src={heroImage} alt="Community" className="w-full h-[280px] sm:h-[380px] lg:h-[480px] object-cover" loading="eager" />
                </div>
                {/* Floating badge */}
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">24h Response</div>
                      <div className="text-xs text-gray-500">Average reply time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Text */}
            <div className="text-center lg:text-left order-1 lg:order-2 pt-8 lg:pt-0">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-5 py-2.5 mb-8 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs tracking-wide">WE'RE HERE TO HELP</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent">Let's Grow Your Ministry</span>
                <br />
                <span className="text-gray-900 font-extrabold">Together</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 font-medium max-w-xl mx-auto lg:mx-0 mb-10">
                Get answers, request support, or explore how SoapBox Church Admin can serve your church.
              </p>

              {/* Quick Contact Pills */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-10">
                <a href="mailto:support@soapboxsuperapp.com" className="inline-flex items-center gap-2 bg-purple-50 px-5 py-3 rounded-full text-sm font-semibold text-purple-700 hover:bg-purple-100 transition-all duration-300">
                  <Mail className="w-4 h-4" />
                  Email Support
                </a>
                <a href="https://calendly.com/soapboxsuperapp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-purple-50 px-5 py-3 rounded-full text-sm font-semibold text-purple-700 hover:bg-purple-100 transition-all duration-300">
                  <Calendar className="w-4 h-4" />
                  Book a Demo
                </a>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                <div className="bg-purple-50 rounded-2xl px-4 py-4 text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-700">24h</div>
                  <div className="text-purple-600/70 text-xs mt-1 font-medium">Response</div>
                </div>
                <div className="bg-purple-50 rounded-2xl px-4 py-4 text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-700">Live</div>
                  <div className="text-purple-600/70 text-xs mt-1 font-medium">Support</div>
                </div>
                <div className="bg-purple-50 rounded-2xl px-4 py-4 text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-700">Free</div>
                  <div className="text-purple-600/70 text-xs mt-1 font-medium">Demos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">

        {/* Contact Methods Grid */}
        <section className="mb-12 sm:mb-16">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Support & Technical Help */}
            <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 p-6 sm:p-8 border border-gray-200 hover:border-purple-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">
                Support & Technical Help
              </h2>
              <p className="text-gray-500 mb-6">
                Need help using the app or reporting an issue?
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-100 group-hover:bg-purple-50 transition-colors duration-300">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Email Support</div>
                    <a href="mailto:support@soapboxsuperapp.com" className="text-purple-600 hover:underline text-sm">
                      support@soapboxsuperapp.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-100 group-hover:bg-purple-50 transition-colors duration-300">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Help Center</div>
                    <span className="text-gray-500 text-xs">Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Church Partnerships & Demos */}
            <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 p-6 sm:p-8 border border-gray-200 hover:border-purple-200 overflow-hidden">
              <div className="absolute top-4 right-4 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Popular
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">
                Church Partnerships & Demos
              </h2>
              <p className="text-gray-500 mb-6">
                Interested in bringing SoapBox to your church?
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-100 group-hover:bg-purple-50 transition-colors duration-300">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Schedule a Demo</div>
                    <Button
                      onClick={() => window.open('https://calendly.com/soapboxsuperapp', '_blank')}
                      className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white mt-2 w-full shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      Book a Time
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-100 group-hover:bg-purple-50 transition-colors duration-300">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Talk to Sales</div>
                    <a href="mailto:sales@soapboxsuperapp.com" className="text-purple-600 hover:underline block text-xs">
                      sales@soapboxsuperapp.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* General Inquiries */}
            <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 p-6 sm:p-8 border border-gray-200 hover:border-purple-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                <DoveIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">
                General Inquiries
              </h2>
              <p className="text-gray-500 mb-6">
                For press, partnerships, or anything else:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-100 group-hover:bg-purple-50 transition-colors duration-300">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">General Email</div>
                    <a href="mailto:hello@soapboxsuperapp.com" className="text-purple-600 hover:underline text-sm">
                      hello@soapboxsuperapp.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-100 group-hover:bg-purple-50 transition-colors duration-300">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Mailing Address</div>
                    <div className="text-gray-500 text-xs">
                      SoapBox Super App<br />
                      1130 E. Clark Street, #150-204<br />
                      Orcutt, CA 93455, USA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="mb-12 sm:mb-16">
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-3xl p-6 sm:p-8 lg:p-12 border border-purple-100 shadow-lg overflow-hidden">
              <div className="absolute top-0 left-0 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

              <div className="relative text-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                  <Send className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Send Us a Message
                </h2>
                <p className="text-gray-500">
                  We'd love to hear from you and support your ministry journey.
                </p>
              </div>

              {isSubmitted ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Message Sent Successfully!
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Thank you for reaching out. We'll get back to you within 24 hours. Stay blessed!
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white min-w-[160px]"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-gray-900 font-medium">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className={`mt-2 focus:ring-purple-500 focus:border-purple-500 bg-white ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-gray-900 font-medium">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className={`mt-2 focus:ring-purple-500 focus:border-purple-500 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      className={`mt-2 min-h-[120px] focus:ring-purple-500 focus:border-purple-500 ${errors.message ? 'border-red-500 focus:border-red-500' : ''}`}
                      placeholder="How can we help you and your ministry?"
                    />
                    {errors.message && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errors.message}
                      </div>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{errors.submit}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white w-full py-3 text-lg font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send My Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Follow Us & Prayer Section */}
        <section className="mb-12 sm:mb-16">
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Follow Us */}
            <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-xl p-6 sm:p-8 border border-gray-100 hover:border-purple-200 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="w-14 h-14 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Follow Us
              </h2>
              <p className="text-gray-600 mb-6">
                Stay connected and inspired:
              </p>

              <div className="grid grid-cols-3 gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61555178230788"
                  target="_blank"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:scale-105 hover:shadow-md transition-all duration-300"
                  rel="noopener noreferrer"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <Facebook className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 text-xs">Facebook</span>
                </a>

                <a
                  href="https://x.com/soapboxsuperapp"
                  target="_blank"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-gray-100 hover:border-gray-400 hover:scale-105 hover:shadow-md transition-all duration-300"
                  rel="noopener noreferrer"
                >
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md">
                    <Twitter className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 text-xs">Twitter / X</span>
                </a>

                <a
                  href="https://www.linkedin.com/company/soapboxsuperapp"
                  target="_blank"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:scale-105 hover:shadow-md transition-all duration-300"
                  rel="noopener noreferrer"
                >
                  <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center shadow-md">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 text-xs">LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Need Help */}
            <div className="relative bg-gradient-to-br from-[#7C3AED] via-[#5B21B6] to-[#2563EB] rounded-3xl p-6 sm:p-8 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-300/20 rounded-full blur-3xl" />

              <div className="relative">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                  <PrayingHandsIcon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-3">
                  Ready to Transform Your Church?
                </h2>
                <p className="text-purple-100 mb-6">
                  Start your free trial and experience church management the way it should be.
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/10">
                  <p className="text-white/90 italic text-sm">
                    "For where two or three gather in My name, there am I with them."
                  </p>
                  <p className="text-purple-200 text-xs mt-2 font-medium">— Matthew 18:20</p>
                </div>

                <Link href="/login">
                  <Button
                    className="bg-white text-purple-600 hover:bg-gray-100 hover:scale-105 w-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative bg-gradient-to-br from-[#7C3AED] via-[#5B21B6] to-[#2563EB] rounded-3xl p-8 sm:p-10 lg:p-14 text-center text-white overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <CrossIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Our Mission to Serve You
            </h2>
            <p className="text-base sm:text-lg text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Our mission is to serve faith communities like yours with technology that empowers connection, digital discipleship, and Gospel-centered growth. We're here to support your ministry every step of the way.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 hover:scale-105 px-10 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px] shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                >
                  Start Free Today
                </Button>
              </Link>
              <Button
                size="lg"
                className="bg-transparent text-white border-2 border-white/80 hover:bg-white/10 hover:border-white hover:scale-105 px-10 py-4 text-lg font-semibold w-full sm:w-auto min-w-[200px] transition-all duration-300 rounded-xl"
                onClick={() => window.open('https://calendly.com/soapboxsuperapp', '_blank')}
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
