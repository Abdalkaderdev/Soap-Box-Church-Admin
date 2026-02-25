import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  CheckCircle2,
  ArrowRight,
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
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    popular: false,
    features: [
      "Up to 100 members",
      "Basic member management",
      "Donation tracking",
      "Email communications",
      "1 admin user",
      "Community support",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Growth",
    description: "For growing churches with expanding needs",
    price: 49,
    period: "/month",
    icon: Building2,
    color: "bg-sage-100",
    iconColor: "text-sage-700",
    popular: true,
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
  },
  {
    name: "Enterprise",
    description: "For large churches and multi-campus organizations",
    price: 149,
    period: "/month",
    icon: Crown,
    color: "bg-purple-100",
    iconColor: "text-purple-600",
    popular: false,
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
              <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <Link href="/pricing" className="text-sage-700 font-medium">Pricing</Link>
              <Link href="/#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Testimonials</Link>
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
            Simple, Transparent
            <span className="text-sage-700"> Pricing</span>
          </h1>
          <p className="text-xl text-gray-600">
            Start free, upgrade as you grow. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl border-2 ${
                  plan.popular ? 'border-sage-500 shadow-xl' : 'border-gray-200'
                } p-8`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-sage-700 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`w-14 h-14 ${plan.color} rounded-xl flex items-center justify-center mb-6`}>
                  <plan.icon className={`w-7 h-7 ${plan.iconColor}`} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-sage-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/login">
                  <Button
                    className={`w-full py-3 font-semibold ${
                      plan.popular
                        ? 'bg-sage-700 hover:bg-sage-800 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-sage-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-xl text-sage-100 mb-8">
            Our team is here to help you find the right plan for your church.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-sage-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                Start Free Trial
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-sage-700 px-8 py-4 text-lg"
            >
              Contact Sales
            </Button>
          </div>
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
