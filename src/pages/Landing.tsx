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
  BarChart3,
  Shield,
  Globe,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Zap,
  Star,
  Church,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Member Management",
    description: "Track membership, families, attendance, and engagement all in one place.",
    color: "from-sky-500 to-blue-500",
  },
  {
    icon: DollarSign,
    title: "Donation Tracking",
    description: "Manage tithes, offerings, and donations with detailed reporting and tax receipts.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Calendar,
    title: "Event Planning",
    description: "Schedule services, meetings, and special events with automated reminders.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Mail,
    title: "Communications",
    description: "Send emails, SMS, and push notifications to keep your congregation connected.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Heart,
    title: "Volunteer Management",
    description: "Coordinate volunteers, track hours, and manage ministry teams effectively.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: BookOpen,
    title: "Discipleship Tracking",
    description: "Monitor spiritual growth journeys, Bible studies, and mentorship programs.",
    color: "from-indigo-500 to-blue-500",
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#benefits" className="text-slate-400 hover:text-white transition-colors">Benefits</a>
            <a href="#testimonials" className="text-slate-400 hover:text-white transition-colors">Testimonials</a>
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-sky-400" />
              <span className="text-sm text-sky-300">Built for growing churches</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-sky-200 to-blue-200 bg-clip-text text-transparent">
                Church Management
              </span>
              <br />
              <span className="text-slate-400">Made Simple</span>
            </h1>

            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              The all-in-one platform to manage members, track donations, plan events, and grow your congregation. Powered by SoapBox Super App.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 h-14 px-8 text-lg shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 h-14 px-8 text-lg">
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-4xl font-bold text-sky-400">10K+</div>
                <div className="text-sm text-slate-500">Churches</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-sky-400">2M+</div>
                <div className="text-sm text-slate-500">Members Managed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-sky-400">$50M+</div>
                <div className="text-sm text-slate-500">Donations Tracked</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Manage Your Church
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              From member management to financial tracking, we've got all the tools your church needs in one powerful platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all group">
                <CardContent className="pt-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-sky-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Churches Choose SoapBox
              </h2>
              <p className="text-lg text-slate-400 mb-8">
                Join thousands of churches who trust SoapBox to manage their communities effectively and grow their ministries.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Dashboard preview mockup */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-800 rounded-lg p-3">
                      <div className="text-2xl font-bold text-sky-400">1,234</div>
                      <div className="text-xs text-slate-500">Members</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3">
                      <div className="text-2xl font-bold text-emerald-400">$45K</div>
                      <div className="text-xs text-slate-500">Donations</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3">
                      <div className="text-2xl font-bold text-violet-400">89%</div>
                      <div className="text-xs text-slate-500">Attendance</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3">
                      <div className="text-2xl font-bold text-orange-400">156</div>
                      <div className="text-xs text-slate-500">Volunteers</div>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4 h-40 flex items-end gap-2">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-sky-500/50 to-sky-500 rounded-t" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Church Leaders
            </h2>
            <p className="text-lg text-slate-400">
              See what pastors and administrators are saying about SoapBox
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.author}</div>
                      <div className="text-sm text-slate-500">{testimonial.church}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 rounded-2xl border border-sky-500/20 p-12">
            <Church className="h-16 w-16 text-sky-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Church Management?
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Join thousands of churches using SoapBox to grow their communities.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 h-14 px-8 text-lg shadow-lg shadow-sky-500/25">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-slate-500 mt-4">
              No credit card required. 30-day free trial.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo size="sm" className="mb-4" />
              <p className="text-sm text-slate-500">
                The complete church management platform powered by SoapBox Super App.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#features" className="hover:text-sky-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-sky-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Training</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-sky-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} SoapBox Super App. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-500 hover:text-sky-400 transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-sky-400 transition-colors">
                <Shield className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
