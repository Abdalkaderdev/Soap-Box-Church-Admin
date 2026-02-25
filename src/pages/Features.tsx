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

const featureCategories = [
  {
    title: "Member Management",
    description: "Track and engage your congregation",
    icon: Users,
    color: "bg-sage-100",
    iconColor: "text-sage-700",
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
    color: "bg-amber-100",
    iconColor: "text-amber-600",
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
    color: "bg-sky-100",
    iconColor: "text-sky-600",
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
    color: "bg-rose-100",
    iconColor: "text-rose-600",
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
    color: "bg-purple-100",
    iconColor: "text-purple-600",
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo size="sm" />
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-sage-700 font-medium">Features</Link>
              <Link href="/#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</Link>
              <a href="https://soapboxsuperapp.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">SoapBox</a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
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

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-br from-sage-50 to-sage-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="text-sage-700"> Modern Ministry</span>
          </h1>
          <p className="text-xl text-gray-600">
            Explore all the tools that make SoapBox the most complete church management solution.
          </p>
        </div>
      </section>

      {/* Feature Sections */}
      {featureCategories.map((category, categoryIndex) => (
        <section
          key={category.title}
          className={`py-20 px-4 ${categoryIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <div className={`w-14 h-14 ${category.color} rounded-xl flex items-center justify-center`}>
                <category.icon className={`w-7 h-7 ${category.iconColor}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-5 h-5 ${category.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-20 px-4 bg-sage-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-sage-100 mb-8">
            Try SoapBox free for 30 days. No credit card required.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-white text-sage-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SoapBox Super App. All rights reserved.
          </p>
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              Back to Home
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
