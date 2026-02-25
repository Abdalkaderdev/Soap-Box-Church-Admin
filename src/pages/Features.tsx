import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import {
  Users,
  DollarSign,
  Calendar,
  Mail,
  Heart,
  BookOpen,
  BarChart3,
  Shield,
  Globe,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Database,
  Bell,
  FileText,
  PieChart,
  Layers,
  Lock,
  Zap,
  Cloud,
  Workflow,
  Settings,
  MessageSquare,
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

export default function Features() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sky-400">Features</Link>
            <Link href="/pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="/#testimonials" className="text-slate-400 hover:text-white transition-colors">Testimonials</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-400 hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-sky-400" />
              <span className="text-sm text-sky-300">Comprehensive Features</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to Manage Your Church
            </h1>
            <p className="text-xl text-slate-400">
              Explore all the powerful features that make SoapBox the most complete church management solution.
            </p>
          </div>
        </div>
      </section>

      {/* Member Management */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Member Management</h2>
              <p className="text-slate-400">Track and engage your congregation</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {memberFeatures.map((feature) => (
              <Card key={feature.title} className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <feature.icon className="h-8 w-8 text-sky-400 mb-4" />
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Tracking */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Donation & Giving</h2>
              <p className="text-slate-400">Manage finances with ease</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {donationFeatures.map((feature) => (
              <Card key={feature.title} className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <feature.icon className="h-8 w-8 text-emerald-400 mb-4" />
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Communications */}
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Communications</h2>
              <p className="text-slate-400">Stay connected with your congregation</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {communicationFeatures.map((feature) => (
              <Card key={feature.title} className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <feature.icon className="h-8 w-8 text-violet-400 mb-4" />
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Admin & Security */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Admin & Security</h2>
              <p className="text-slate-400">Enterprise-grade management tools</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminFeatures.map((feature) => (
              <Card key={feature.title} className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <feature.icon className="h-8 w-8 text-orange-400 mb-4" />
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 rounded-2xl border border-sky-500/20 p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-slate-400 mb-8">
              Try SoapBox free for 30 days. No credit card required.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} SoapBox Super App. All rights reserved.
            </p>
            <Link href="/">
              <Button variant="ghost" className="text-slate-400 hover:text-white">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
