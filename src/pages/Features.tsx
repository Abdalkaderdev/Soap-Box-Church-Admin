import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  Users,
  DollarSign,
  Mail,
  BarChart3,
  ArrowRight,
  Database,
  Bell,
  FileText,
  PieChart,
  Layers,
  Lock,
  Cloud,
  Workflow,
  Settings,
  MessageSquare,
  Shield,
  Calendar,
  Heart,
  BookOpen,
  CheckCircle,
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

// Hero background image
const heroImage = "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=1920&q=80";

const featureCategories = [
  {
    title: "Member Management",
    description: "Track and engage your congregation",
    icon: Users,
    features: [
      {
        icon: Users,
        title: "Member Profiles",
        description: "Comprehensive profiles with contact info, family connections, and custom fields.",
      },
      {
        icon: Database,
        title: "Family Management",
        description: "Link family members, track households, and manage relationships.",
      },
      {
        icon: BarChart3,
        title: "Attendance Tracking",
        description: "Track service attendance, event participation, and engagement trends.",
      },
      {
        icon: FileText,
        title: "Notes & History",
        description: "Keep detailed notes on pastoral care, meetings, and interactions.",
      },
    ],
  },
  {
    title: "Donation & Giving",
    description: "Manage finances with ease",
    icon: DollarSign,
    features: [
      {
        icon: DollarSign,
        title: "Donation Processing",
        description: "Accept online donations, recurring giving, and multiple payment methods.",
      },
      {
        icon: PieChart,
        title: "Fund Management",
        description: "Track donations by fund, campaign, or designated purpose.",
      },
      {
        icon: FileText,
        title: "Tax Receipts",
        description: "Automatically generate year-end giving statements for donors.",
      },
      {
        icon: BarChart3,
        title: "Financial Reports",
        description: "Detailed reports on giving trends, pledges, and budget tracking.",
      },
    ],
  },
  {
    title: "Communications",
    description: "Stay connected with your congregation",
    icon: Mail,
    features: [
      {
        icon: Mail,
        title: "Email Campaigns",
        description: "Send beautiful emails with templates and personalization.",
      },
      {
        icon: MessageSquare,
        title: "SMS Messaging",
        description: "Reach members instantly with text message broadcasts.",
      },
      {
        icon: Bell,
        title: "Push Notifications",
        description: "Mobile app notifications for timely announcements.",
      },
      {
        icon: Layers,
        title: "Segmented Lists",
        description: "Target specific groups with tailored communications.",
      },
    ],
  },
  {
    title: "Events & Volunteers",
    description: "Coordinate ministry activities",
    icon: Calendar,
    features: [
      {
        icon: Calendar,
        title: "Event Scheduling",
        description: "Plan services, Bible studies, and special events with ease.",
      },
      {
        icon: Heart,
        title: "Volunteer Management",
        description: "Coordinate volunteers and track service hours.",
      },
      {
        icon: CheckCircle,
        title: "Check-in System",
        description: "Secure child check-in and attendance tracking.",
      },
      {
        icon: BookOpen,
        title: "Small Groups",
        description: "Manage small group meetings and participation.",
      },
    ],
  },
  {
    title: "Admin & Security",
    description: "Enterprise-grade management tools",
    icon: Settings,
    features: [
      {
        icon: Lock,
        title: "Role-Based Access",
        description: "Control who can view and edit different sections.",
      },
      {
        icon: Shield,
        title: "Data Security",
        description: "Enterprise-grade encryption and secure backups.",
      },
      {
        icon: Cloud,
        title: "Cloud-Based",
        description: "Access from anywhere, always up-to-date.",
      },
      {
        icon: Workflow,
        title: "Integrations",
        description: "Connect with your favorite tools and services.",
      },
    ],
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo size="sm" />
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-purple-600 font-semibold">Features</Link>
              <Link href="/about" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Contact</Link>
              <a href="https://soapboxsuperapp.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">SoapBox</a>
            </div>

            {/* CTA Buttons */}
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
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" loading="eager" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/80" />
          <div className="absolute inset-0 bg-purple-900/20" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white rounded-full px-5 py-2.5 mb-8 text-sm font-medium border border-white/20">
            <ChurchIcon className="w-4 h-4" />
            <span className="text-xs tracking-wide">COMPLETE PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Powerful Features for</span>
            <br />
            <span className="text-purple-300 font-extrabold">Modern Ministry</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 font-medium max-w-2xl mx-auto mb-12">
            Explore all the tools that make SoapBox Church Admin the most complete church management solution.
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-5 text-center border border-white/10">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">50+</div>
              <div className="text-gray-300 text-xs mt-1 font-medium">Features</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-5 text-center border border-white/10">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">5</div>
              <div className="text-gray-300 text-xs mt-1 font-medium">Categories</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-5 text-center border border-white/10">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">24/7</div>
              <div className="text-gray-300 text-xs mt-1 font-medium">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((category, categoryIndex) => (
        <section
          key={category.title}
          className={`py-20 px-4 ${categoryIndex % 2 === 0 ? 'bg-white' : 'bg-gradient-to-br from-purple-50 to-purple-100'}`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <category.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{category.title}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.features.map((feature) => (
                <div
                  key={feature.title}
                  className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Included with SoapBox Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
            <CrossIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Included with Your SoapBox Subscription
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Church Admin comes at no additional cost with every SoapBox Super App subscription.
            Get complete church management alongside prayer walls, devotionals, and community features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://soapboxsuperapp.com/pricing" target="_blank" rel="noopener noreferrer">
              <Button className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white px-8 py-3 shadow-lg shadow-purple-500/25">
                View SoapBox Plans
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
            <Link href="/login">
              <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3">
                Try Free for 30 Days
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] via-[#5B21B6] to-[#2563EB]" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ChurchIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Try SoapBox free for 30 days. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
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
