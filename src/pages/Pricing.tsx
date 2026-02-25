import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Building2,
  Crown,
} from "lucide-react";

const plans = [
  {
    name: "Starter",
    description: "Perfect for small churches just getting started",
    price: 0,
    period: "forever",
    icon: Users,
    gradient: "from-slate-600 to-slate-700",
    iconBg: "bg-slate-500/10",
    iconColor: "text-slate-400",
    borderColor: "border-slate-700",
    features: [
      "Up to 100 members",
      "Basic member management",
      "Donation tracking",
      "Email communications",
      "1 admin user",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Growth",
    description: "For growing churches with expanding needs",
    price: 49,
    period: "/month",
    icon: Building2,
    gradient: "from-blue-600 to-indigo-600",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    borderColor: "border-amber-500/50",
    features: [
      "Up to 500 members",
      "Advanced member profiles",
      "Online giving portal",
      "SMS & push notifications",
      "5 admin users",
      "Event management",
      "Volunteer scheduling",
      "Priority email support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large churches and multi-campus organizations",
    price: 149,
    period: "/month",
    icon: Crown,
    gradient: "from-violet-600 to-purple-600",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    borderColor: "border-slate-700",
    features: [
      "Unlimited members",
      "Multi-campus support",
      "Advanced analytics",
      "Custom integrations",
      "Unlimited admin users",
      "Dedicated account manager",
      "Custom training",
      "Phone support",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I try before I buy?",
    answer: "All paid plans come with a 30-day free trial. No credit card required to start.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, ACH bank transfers, and can invoice for annual plans.",
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer: "Yes, you can change your plan at any time. Changes take effect on your next billing cycle.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes! Save 20% when you pay annually instead of monthly.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer: "Your data remains available for 30 days after cancellation. You can export it anytime.",
  },
  {
    question: "Is my church's data secure?",
    answer: "Absolutely. We use 256-bit encryption, secure cloud storage, and regular backups.",
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Features</Link>
            <Link href="/pricing" className="text-amber-400 font-medium text-sm">Pricing</Link>
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
              <span className="text-sm text-amber-300 font-medium">Simple, Transparent Pricing</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Plans for Churches
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                of All Sizes
              </span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              Start free, upgrade as you grow. No hidden fees, no surprises.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative bg-slate-900/60 backdrop-blur-sm border ${plan.borderColor} ${
                  plan.popular ? "shadow-xl shadow-amber-500/10 scale-[1.02]" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4 pt-8">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${plan.gradient} mx-auto mb-4 shadow-lg`}>
                    <plan.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-8">
                    <span className="text-5xl font-bold text-white">
                      {plan.price === 0 ? "Free" : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-slate-400 ml-1">{plan.period}</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/login">
                    <Button
                      className={`w-full h-12 font-semibold ${
                        plan.popular
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 shadow-lg shadow-amber-500/20"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-950/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-center text-slate-400 mb-12">
              Everything you need to know about our pricing
            </p>

            <div className="grid gap-4">
              {faqs.map((faq) => (
                <Card key={faq.question} className="bg-slate-900/60 border-slate-800/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-3xl border border-slate-800 p-12 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4 text-white">Still Have Questions?</h2>
              <p className="text-lg text-slate-400 mb-8">
                Our team is here to help you find the right plan for your church.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login">
                  <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-semibold h-12 px-8 shadow-xl shadow-amber-500/25">
                    Start Free Trial
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600 h-12 px-8">
                  Contact Sales
                </Button>
              </div>
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
