import { Navbar } from '@/components/custom/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Users,
  Target,
  Lightbulb,
  Globe,
  TrendingUp,
  Heart,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: 'Community First',
      description:
        'We believe in empowering traders and farmers by building tools they actually need.',
    },
    {
      icon: Shield,
      title: 'Transparency',
      description:
        'Real-time, verified prices from actual market traders ensure accurate information.',
    },
    {
      icon: TrendingUp,
      title: 'Growth',
      description:
        'We help traders make smarter decisions and grow their businesses profitably.',
    },
    {
      icon: Globe,
      title: 'Scale Across Africa',
      description:
        'Starting in Nigeria, expanding to bring market intelligence to all African traders.',
    },
  ];

  const features = [
    {
      title: 'Live Market Map',
      description: 'Real-time prices from 1,248+ markets across Nigeria',
    },
    {
      title: 'AI Market Assistant',
      description: 'Chat with MarketMama to get instant price checks and insights',
    },
    {
      title: 'Price Trends',
      description: 'Historical data and trend analysis for better buying decisions',
    },
    {
      title: 'Verified Traders',
      description: 'Connect with trusted vendors and market reporters',
    },
    {
      title: 'Price Alerts',
      description: 'Get notified when prices drop on your favorite commodities',
    },
    {
      title: 'Community Reports',
      description: 'Contribute prices and earn rewards for keeping data accurate',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About MarketMama
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            We're on a mission to make market prices transparent and accessible to every trader and farmer across Africa. Smart decisions start with knowing the right price.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Try MarketMama
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline">Learn More</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-white border-y border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 mb-4">
                Every day, millions of traders across Africa make buying and selling decisions without access to real-time market information. This leads to poor deals, wasted time, and lost profits.
              </p>
              <p className="text-gray-600 mb-4">
                MarketMama changes that. By combining AI, real-time crowd data, and local market knowledge, we give traders the power to make smarter decisions and grow their businesses.
              </p>
              <p className="text-gray-600">
                We believe transparent prices lead to fair commerce and better livelihoods for millions.
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg p-8 flex items-center justify-center min-h-64">
              <div className="text-center">
                <Target className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <p className="text-gray-700 font-semibold">Empowering Africa's Traders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <Icon className="w-8 h-8 text-emerald-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            What We Offer
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Built for traders, by traders. Every feature is designed to solve real market challenges.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Built by a Community
          </h2>
          <p className="text-gray-600 mb-8">
            MarketMama is built by traders, engineers, and designers who believe in transparent commerce. We work closely with market reporters and traders across Nigeria to make sure we're solving real problems.
          </p>
          <Card className="p-8 bg-emerald-50 border-2 border-emerald-200">
            <Users className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold mb-2">
              Join Our Community
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Help us improve MarketMama and earn rewards for accurate price reports
            </p>
            <Link href="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Get Started
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Shop Smart?
          </h2>
          <p className="text-emerald-100 mb-8">
            Chat with MarketMama now to get real-time prices and market intelligence
          </p>
          <Link href="/">
            <Button
              variant="secondary"
              className="bg-white text-emerald-700 hover:bg-gray-50"
            >
              Start Chatting →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
