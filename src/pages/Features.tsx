import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Sparkles,
  Cloud,
  Workflow,
  Settings,
  MessageSquare,
  Shield,
} from "lucide-react";

const memberFeatures = [
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
];

const donationFeatures = [
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
];

const communicationFeatures = [
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
];

const adminFeatures = [
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
];

const featureSections = [
  {
    title: "Member Management",
    subtitle: "Track and engage your congregation",
    features: memberFeatures,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    gradientFrom: "from-blue-600",
    gradientTo: "to-indigo-600",
    icon: Users,
  },
  {
    title: "Donation & Giving",
    subtitle: "Manage finances with ease",
    features: donationFeatures,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    gradientFrom: "from-emerald-600",
    gradientTo: "to-teal-600",
    icon: DollarSign,
  },
  {
    title: "Communications",
    subtitle: "Stay connected with your congregation",
    features: communicationFeatures,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
    gradientFrom: "from-violet-600",
    gradientTo: "to-purple-600",
    icon: Mail,
  },
  {
    title: "Admin & Security",
    subtitle: "Enterprise-grade management tools",
    features: adminFeatures,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    gradientFrom: "from-amber-500",
    gradientTo: "to-orange-500",
    icon: Settings,
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-amber-400 font-medium text-sm">Features</Link>
            <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Pricing</Link>
            <Link href="/#testimonials" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Testimonials</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-semibold shadow-lg shadow-amber-500/20">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/8 rounded-full blur-3xl" />
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-amber-300 font-medium">Comprehensive Features</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                Manage Your Church
              </span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              Explore all the powerful features that make SoapBox the most complete church management solution.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      {featureSections.map((section, sectionIndex) => (
        <section
          key={section.title}
          className={`py-20 ${sectionIndex % 2 === 0 ? 'bg-slate-950/50' : ''}`}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-10">
              <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${section.gradientFrom} ${section.gradientTo} shadow-lg`}>
                <section.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                <p className="text-slate-400">{section.subtitle}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {section.features.map((feature) => (
                <Card key={feature.title} className="bg-slate-900/60 border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 group backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className={`inline-flex p-3 rounded-xl ${section.iconBg} mb-4`}>
                      <feature.icon className={`h-6 w-6 ${section.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">{feature.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-3xl border border-slate-800 p-12 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4 text-white">Ready to Get Started?</h2>
              <p className="text-lg text-slate-400 mb-8">
                Try SoapBox free for 30 days. No credit card required.
              </p>
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-semibold shadow-xl shadow-amber-500/25">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} SoapBox Super App. All rights reserved.
            </p>
            <Link href="/">
              <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
