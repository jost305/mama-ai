
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  MapPin,
  Package,
  Users,
  ArrowUp,
  ArrowDown,
  Eye,
} from 'lucide-react';

export default function ExplorePage() {
  const trendingCommodities = [
    { name: 'Tomatoes', price: '1,900', change: '-8%', trend: 'down' },
    { name: 'Onions', price: '1,500', change: '+3%', trend: 'up' },
    { name: 'Pepper', price: '120,000', change: '+5%', trend: 'up' },
    { name: 'Cows', price: '1,300,000', change: '-2%', trend: 'down' },
  ];

  const topMarkets = [
    { name: 'Kano Market', location: 'Kano', reports: 1248 },
    { name: 'Lagos Central', location: 'Lagos', reports: 892 },
    { name: 'Kaduna Market', location: 'Kaduna', reports: 756 },
    { name: 'Ibadan Central', location: 'Ibadan', reports: 643 },
  ];

  const marketStats = [
    { label: 'Live Markets', value: '1,248', icon: MapPin, color: 'emerald' },
    { label: 'Price Reports', value: '45K+', icon: TrendingUp, color: 'blue' },
    { label: 'Active Traders', value: '8.5K', icon: Users, color: 'amber' },
    { label: 'Commodities', value: '150+', icon: Package, color: 'rose' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Markets</h1>
          <p className="text-gray-600">Discover the latest market trends, prices, and opportunities across Africa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {marketStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Trending Now
            </h2>
            <a href="#" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">View all →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingCommodities.map((commodity, index) => (
              <Card key={index} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">📈</div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${commodity.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {commodity.trend === 'down' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                    {commodity.change}
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">{commodity.name}</p>
                <p className="text-lg font-bold text-gray-900">{commodity.price}</p>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Top Markets
            </h2>
            <a href="/map" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">Explore map →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topMarkets.map((market, index) => (
              <Card key={index} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{market.name}</p>
                    <p className="text-sm text-gray-600">{market.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-emerald-600">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">{market.reports}</span>
                    </div>
                    <p className="text-xs text-gray-500">reports</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Get Real-Time Market Updates</h3>
              <p className="text-emerald-100">Chat with MarketMama to get instant price checks and market intelligence.</p>
            </div>
            <Button variant="secondary" className="bg-white text-emerald-700 hover:bg-gray-50">Ask MarketMama →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
