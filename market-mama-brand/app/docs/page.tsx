import { Navbar } from '@/components/custom/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  HelpCircle,
  FileText,
  Zap,
  MessageSquare,
  ChevronRight,
  Search,
} from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {

  const docSections = [
    {
      title: 'Getting Started',
      description: 'Learn the basics and get up and running with MarketMama',
      icon: Zap,
      articles: [
        { title: 'What is MarketMama?', slug: 'what-is-market-mama' },
        { title: 'Creating Your Account', slug: 'creating-account' },
        { title: 'Your First Price Check', slug: 'first-price-check' },
      ],
    },
    {
      title: 'Features',
      description: 'Explore all the features MarketMama offers',
      icon: BookOpen,
      articles: [
        { title: 'Live Market Map', slug: 'live-market-map' },
        { title: 'Price Alerts', slug: 'price-alerts' },
        { title: 'Ask MarketMama (Chat)', slug: 'ask-market-mama' },
        { title: 'Watchlist', slug: 'watchlist' },
      ],
    },
    {
      title: 'For Market Reporters',
      description: 'How to contribute prices and earn rewards',
      icon: FileText,
      articles: [
        { title: 'Becoming a Reporter', slug: 'becoming-reporter' },
        { title: 'Submitting Prices', slug: 'submitting-prices' },
        { title: 'Rewards & Earnings', slug: 'rewards' },
        { title: 'Quality Guidelines', slug: 'quality-guidelines' },
      ],
    },
    {
      title: 'FAQs',
      description: 'Frequently asked questions and answers',
      icon: HelpCircle,
      articles: [
        { title: 'Is the data accurate?', slug: 'data-accuracy' },
        { title: 'How often are prices updated?', slug: 'price-frequency' },
        { title: 'Is MarketMama free?', slug: 'is-free' },
        { title: 'Which markets are covered?', slug: 'covered-markets' },
      ],
    },
  ];

  const popularArticles = [
    {
      title: 'How to Use the Live Market Map',
      views: '2.4K',
      category: 'Features',
    },
    {
      title: 'Understanding Price Trends',
      views: '1.8K',
      category: 'Getting Started',
    },
    {
      title: 'Setting Up Price Alerts',
      views: '1.6K',
      category: 'Features',
    },
    {
      title: 'Reporting Prices Accurately',
      views: '1.2K',
      category: 'For Reporters',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">
            Help & Documentation
          </h1>
          <p className="text-lg text-gray-600 text-center mb-8">
            Find answers, learn features, and get the most out of MarketMama
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search documentation..."
              className="pl-12 pr-4 py-3 w-full text-lg"
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <MessageSquare className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Chat with Support
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Get instant help from our AI assistant
              </p>
              <Link href="/">
                <Button variant="outline" size="sm">
                  Start Chat
                </Button>
              </Link>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <HelpCircle className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Common Questions
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Browse frequently asked questions
              </p>
              <Button variant="outline" size="sm">
                View FAQs
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <FileText className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">
                Report an Issue
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Help us improve MarketMama
              </p>
              <Button variant="outline" size="sm">
                Report Bug
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Documentation
          </h2>
          <div className="space-y-6">
            {docSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <Icon className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {section.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    {section.articles.map((article, articleIndex) => (
                      <Link
                        key={articleIndex}
                        href={`#${article.slug}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group transition-colors"
                      >
                        <span className="text-sm text-gray-700 group-hover:text-emerald-600 font-medium">
                          {article.title}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 px-4 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Popular Articles
          </h2>
          <div className="space-y-4">
            {popularArticles.map((article, index) => (
              <Card
                key={index}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {article.title}
                    </h4>
                    <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {article.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{article.views}</p>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Still Need Help?
          </h2>
          <p className="text-emerald-100 mb-8">
            Can't find what you're looking for? Chat with MarketMama or contact our support team.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button
                variant="secondary"
                className="bg-white text-emerald-700 hover:bg-gray-50"
              >
                Ask MarketMama
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-emerald-700"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
