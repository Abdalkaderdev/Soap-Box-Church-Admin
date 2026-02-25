import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import {
  Users,
  DollarSign,
  Calendar,
  Mail,
  Heart,
  BookOpen,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Star,
  Church,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Member Management",
    description: "Track membership, families, attendance, and engagement all in one place.",
    color: "from-navy-600 to-blue-700",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
  },
  {
    icon: DollarSign,
    title: "Donation Tracking",
    description: "Manage tithes, offerings, and donations with detailed reporting and tax receipts.",
    color: "from-emerald-600 to-teal-600",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
  {
    icon: Calendar,
    title: "Event Planning",
    description: "Schedule services, meetings, and special events with automated reminders.",
    color: "from-violet-600 to-purple-600",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600",
  },
  {
    icon: Mail,
    title: "Communications",
    description: "Send emails, SMS, and push notifications to keep your congregation connected.",
    color: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
  {
    icon: Heart,
    title: "Volunteer Management",
    description: "Coordinate volunteers, track hours, and manage ministry teams effectively.",
    color: "from-rose-500 to-pink-600",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600",
  },
  {
    icon: BookOpen,
    title: "Discipleship Tracking",
    description: "Monitor spiritual growth journeys, Bible studies, and mentorship programs.",
    color: "from-indigo-600 to-blue-600",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-600",
  },
];

const benefits = [
  "Unlimited church members",
  "Secure cloud-based storage",
  "Mobile-friendly design",
  "Real-time analytics dashboard",
  "Automated email receipts",
  "Multi-campus support",
  "Role-based access control",
  "24/7 customer support",
];

const testimonials = [
  {
    quote: "SoapBox has transformed how we manage our growing congregation. The donation tracking alone saves us hours every week.",
    author: "Pastor Michael Johnson",
    church: "Grace Community Church",
    avatar: "MJ",
  },
  {
    quote: "The volunteer management feature is incredible. We can now easily coordinate our 200+ volunteers across multiple ministries.",
    author: "Sarah Williams",
    church: "Riverside Fellowship",
    avatar: "SW",
  },
  {
    quote: "Finally, a church management system that's modern and easy to use. Our staff picked it up in just one training session.",
    author: "David Chen",
    church: "New Life Church",
    avatar: "DC",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Features</a>
            <a href="#benefits" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Benefits</a>
            <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Testimonials</a>
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-indigo-600/6 rounded-full blur-3xl" />
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-amber-300 font-medium">Trusted by 10,000+ churches worldwide</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Church Management
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The all-in-one platform to manage members, track donations, plan events, and grow your congregation with confidence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-semibold h-14 px-8 text-lg shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600 h-14 px-8 text-lg">
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">10K+</div>
                <div className="text-sm text-slate-500 mt-1">Churches</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">2M+</div>
                <div className="text-sm text-slate-500 mt-1">Members Managed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">$50M+</div>
                <div className="text-sm text-slate-500 mt-1">Donations Tracked</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-950/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-amber-400 font-semibold text-sm tracking-wider uppercase mb-3 block">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Everything You Need to Manage Your Church
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              From member management to financial tracking, we have got all the tools your church needs in one powerful platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-slate-900/60 border-slate-800/50 hover:border-slate-700/50 transition-all duration-300 group backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-xl ${feature.iconBg} mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <span className="text-amber-400 font-semibold text-sm tracking-wider uppercase mb-3 block">Why Choose Us</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Why Churches Choose SoapBox
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Join thousands of churches who trust SoapBox to manage their communities effectively and grow their ministries.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Dashboard preview mockup */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-2xl shadow-slate-950/50">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-800/80 rounded-xl p-4">
                      <div className="text-2xl font-bold text-blue-400">1,234</div>
                      <div className="text-xs text-slate-500 mt-1">Members</div>
                    </div>
                    <div className="bg-slate-800/80 rounded-xl p-4">
                      <div className="text-2xl font-bold text-emerald-400">$45K</div>
                      <div className="text-xs text-slate-500 mt-1">Donations</div>
                    </div>
                    <div className="bg-slate-800/80 rounded-xl p-4">
                      <div className="text-2xl font-bold text-violet-400">89%</div>
                      <div className="text-xs text-slate-500 mt-1">Attendance</div>
                    </div>
                    <div className="bg-slate-800/80 rounded-xl p-4">
                      <div className="text-2xl font-bold text-amber-400">156</div>
                      <div className="text-xs text-slate-500 mt-1">Volunteers</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-5 h-44 flex items-end gap-2">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/60 to-blue-400 rounded-t-sm" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-slate-950/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-amber-400 font-semibold text-sm tracking-wider uppercase mb-3 block">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Trusted by Church Leaders
            </h2>
            <p className="text-lg text-slate-400">
              See what pastors and administrators are saying about SoapBox
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="bg-slate-900/60 border-slate-800/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 text-sm leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{testimonial.author}</div>
                      <div className="text-xs text-slate-500">{testimonial.church}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-3xl border border-slate-800 p-12 md:p-16 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-6">
                <Church className="h-10 w-10 text-amber-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Ready to Transform Your Church Management?
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
                Join thousands of churches using SoapBox to grow their communities and streamline operations.
              </p>
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-semibold h-14 px-10 text-lg shadow-xl shadow-amber-500/25">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-slate-500 mt-4">
                No credit card required. 30-day free trial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo size="sm" className="mb-4" />
              <p className="text-sm text-slate-500 leading-relaxed">
                The complete church management platform powered by SoapBox Super App.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#features" className="hover:text-amber-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Support</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Training</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} SoapBox Super App. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-500 hover:text-amber-400 transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-amber-400 transition-colors">
                <Shield className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
