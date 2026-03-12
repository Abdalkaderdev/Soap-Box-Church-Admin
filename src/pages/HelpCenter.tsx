import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Logo } from "@/components/Logo";
import {
  Search,
  BookOpen,
  Users,
  Calendar,
  DollarSign,
  Settings,
  MessageCircle,
  Video,
  FileText,
  HelpCircle,
  ChevronRight,
  Mail,
  Phone,
  Sparkles,
  ChevronDown,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articles: number;
  faqs: FAQItem[];
}

const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of Church Admin",
    icon: <BookOpen className="w-6 h-6" />,
    articles: 8,
    faqs: [
      {
        question: "How do I set up my church profile?",
        answer: "Navigate to Settings > General to configure your church name, address, contact information, and upload your logo. This information will appear throughout the app and on member communications."
      },
      {
        question: "How do I invite team members to the admin portal?",
        answer: "Go to Settings > Team Members and click 'Invite Member'. Enter their email address and select their role (Admin, Staff, or Volunteer). They'll receive an email invitation to join."
      },
      {
        question: "What's the difference between the mobile app and Church Admin?",
        answer: "Church Admin is the web-based management portal for church staff and leaders. The SoapBox mobile app is for your congregation members to engage with your church community, access content, and stay connected."
      }
    ]
  },
  {
    id: "members",
    title: "Member Management",
    description: "Managing your congregation",
    icon: <Users className="w-6 h-6" />,
    articles: 12,
    faqs: [
      {
        question: "How do I add new members?",
        answer: "Go to Members > Add Member to manually add members, or use the Import feature to bulk import from a CSV file. Members can also self-register through the mobile app."
      },
      {
        question: "How do I track member attendance?",
        answer: "Use the Check-in feature during services or events. Members can check in via QR code, or staff can manually check them in. View attendance reports in Analytics."
      },
      {
        question: "Can I create member groups or small groups?",
        answer: "Yes! Go to Groups to create and manage small groups, ministry teams, or any custom groupings. You can assign leaders, set meeting schedules, and communicate with group members."
      }
    ]
  },
  {
    id: "events",
    title: "Events & Calendar",
    description: "Schedule and manage church events",
    icon: <Calendar className="w-6 h-6" />,
    articles: 10,
    faqs: [
      {
        question: "How do I create a recurring event?",
        answer: "When creating an event, enable 'Recurring Event' and select the frequency (daily, weekly, monthly). You can set end dates or have it repeat indefinitely."
      },
      {
        question: "Can members RSVP to events?",
        answer: "Yes! Enable RSVPs when creating an event. Members can RSVP through the mobile app, and you can track responses and send reminders to attendees."
      },
      {
        question: "How do I manage facility bookings for events?",
        answer: "Go to Facilities to set up your rooms and spaces. When creating events, you can select the facility and the system will check for conflicts automatically."
      }
    ]
  },
  {
    id: "giving",
    title: "Donations & Giving",
    description: "Manage tithes and offerings",
    icon: <DollarSign className="w-6 h-6" />,
    articles: 15,
    faqs: [
      {
        question: "How do I set up online giving?",
        answer: "Go to Settings > Giving to connect your payment processor (Stripe). Configure your giving funds, enable recurring giving, and customize the giving experience."
      },
      {
        question: "How do I generate giving statements?",
        answer: "Navigate to Giving > Statements. Select the date range and members, then generate individual or batch statements. You can email statements directly or download PDFs."
      },
      {
        question: "Can I track pledges?",
        answer: "Yes! Use the Pledge Tracking feature to create pledge campaigns, record pledges, and monitor fulfillment progress throughout your campaign period."
      }
    ]
  },
  {
    id: "communication",
    title: "Communication",
    description: "Reach your congregation",
    icon: <MessageCircle className="w-6 h-6" />,
    articles: 9,
    faqs: [
      {
        question: "How do I send announcements?",
        answer: "Go to Communications > Announcements to create and schedule announcements. You can target specific groups, set display dates, and push to mobile notifications."
      },
      {
        question: "Can I send emails to members?",
        answer: "Yes! Use the Email feature to send newsletters, event invitations, or custom messages. You can use templates and segment your audience by groups or tags."
      },
      {
        question: "How do push notifications work?",
        answer: "When you create announcements or important updates, you can choose to send push notifications to members who have the mobile app installed and notifications enabled."
      }
    ]
  },
  {
    id: "content",
    title: "Content & Media",
    description: "Sermons, devotionals, and more",
    icon: <Video className="w-6 h-6" />,
    articles: 11,
    faqs: [
      {
        question: "How do I upload sermons?",
        answer: "Go to Content > Sermons and click 'Upload Sermon'. You can upload video or audio files, add notes, scripture references, and organize by series."
      },
      {
        question: "Can I create reading plans?",
        answer: "Yes! Use the Reading Plans feature to create custom Bible reading plans for your congregation. Add daily readings, devotionals, and reflection questions."
      },
      {
        question: "How do I manage the content library?",
        answer: "The Content section lets you organize sermons, devotionals, and other resources into categories and series for easy member access through the app."
      }
    ]
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = helpCategories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.faqs.some(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const selectedCategoryData = helpCategories.find(
    (c) => c.id === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo size="sm" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/contact">
                <Button variant="ghost" className="text-gray-600 hover:text-purple-600">
                  Contact Support
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:from-[#6D28D9] hover:to-[#1D4ED8] text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 py-16 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white rounded-full px-4 py-2 mb-6 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>How can we help you today?</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Help Center
          </h1>
          <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
            Find answers to common questions, learn how to use Church Admin features, and get the support you need.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="search"
              placeholder="Search for help articles, FAQs..."
              className="pl-12 pr-4 py-6 text-lg rounded-xl border-0 shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {selectedCategory ? (
          /* Category Detail View */
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory(null)}
              className="text-purple-600 hover:text-purple-700"
            >
              <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
              Back to all categories
            </Button>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    {selectedCategoryData?.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {selectedCategoryData?.title}
                    </CardTitle>
                    <CardDescription>
                      {selectedCategoryData?.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {selectedCategoryData?.faqs.map((faq, index) => (
                    <Collapsible key={index}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        <ChevronDown className="w-5 h-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 py-3 text-gray-600 border-l-2 border-purple-200 ml-4 mt-2">
                        {faq.answer}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Categories Grid */
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Browse by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredCategories.map((category) => (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:shadow-lg hover:border-purple-200 transition-all duration-200"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                        {category.icon}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.articles} articles
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-4">
                      {category.title}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.faqs.slice(0, 2).map((faq, index) => (
                        <p
                          key={index}
                          className="text-sm text-gray-600 flex items-start gap-2"
                        >
                          <HelpCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{faq.question}</span>
                        </p>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full mt-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      View all
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Video className="w-5 h-5 text-purple-600" />
                    Video Tutorials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Watch step-by-step video guides to master Church Admin features.
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                    Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Detailed guides and API documentation for advanced users.
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5 text-orange-600" />
                    API & Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect Church Admin with your favorite tools and services.
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Contact Support */}
        <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
                <p className="text-purple-100">
                  Our support team is here to help you succeed with Church Admin.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/contact">
                  <Button className="bg-white text-purple-600 hover:bg-gray-100">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => window.open("https://calendly.com/soapboxsuperapp", "_blank")}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Schedule a Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <Logo size="sm" />
          <p className="text-gray-400 mt-4">
            &copy; {new Date().getFullYear()} SoapBox Super App. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
