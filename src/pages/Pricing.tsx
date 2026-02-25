import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import {
  CheckCircle2,
  ArrowRight,
  Zap,
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
    color: "from-slate-500 to-slate-600",
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
    color: "from-sky-500 to-blue-600",
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
    color: "from-violet-500 to-purple-600",
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-slate-400 hover:text-white transition-colors">Features</Link>
            <Link href="/pricing" className="text-sky-400">Pricing</Link>
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
              <span className="text-sm text-sky-300">Simple, Transparent Pricing</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Plans for Churches of All Sizes
            </h1>
            <p className="text-xl text-slate-400">
              Start free, upgrade as you grow. No hidden fees, no surprises.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative bg-slate-900/50 border-slate-800 ${
                  plan.popular ? "border-sky-500/50 shadow-lg shadow-sky-500/10" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.color} mx-auto mb-4`}>
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
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
                      className={`w-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
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
      <section className="py-16 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.question} className="bg-slate-900/50 border-slate-800">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                    <p className="text-slate-400 text-sm">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 rounded-2xl border border-sky-500/20 p-12">
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-lg text-slate-400 mb-8">
              Our team is here to help you find the right plan for your church.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Contact Sales
              </Button>
            </div>
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
