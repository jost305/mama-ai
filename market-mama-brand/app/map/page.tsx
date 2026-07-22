
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Filter,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Navigation,
} from 'lucide-react';
import { useState } from 'react';

export default function MapPage() {
  const [selectedProduct, setSelectedProduct] = useState('pepper');
  const [supplyFilter, setSupplyFilter] = useState('all');

  const products = [
    { id: 'tomatoes', name: 'Tomatoes', emoji: 'Tomato' },
    { id: 'onions', name: 'Onions', emoji: 'Onion' },
    { id: 'pepper', name: 'Pepper', emoji: 'Pepper' },
    { id: 'cows', name: 'Cows', emoji: 'Cows' },
    { id: 'yam', name: 'Yam', emoji: 'Yam' },
  ];

  const marketLocations = [
    { city: 'Kano', price: '13,800', supply: 'high', change: '+4%', reports: 324 },
    { city: 'Kaduna', price: '13,700', supply: 'medium', change: '-1%', reports: 187 },
    { city: 'Maiduguri', price: '15,000', supply: 'low', change: '+6%', reports: 92 },
    { city: 'Jos', price: '13,900', supply: 'medium', change: '+2%', reports: 156 },
    { city: 'Lagos', price: '14,500', supply: 'high', change: '+3%', reports: 412 },
    { city: 'Abuja', price: '13,400', supply: 'high', change: '+1%', reports: 298 },
  ];

  const getSupplyColor = (supply: string) => {
    switch (supply) {
      case 'high':
        return 'bg-emerald-100 text-emerald-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      case 'low':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSupplyDot = (supply: string) => {
    switch (supply) {
      case 'high':
        return 'bg-emerald-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Market Map</h1>
            <p className="text-gray-600">Real-time prices from markets across Nigeria. Updates every 2 minutes.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="p-4 h-fit sticky top-24">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Select Product
                  </h3>
                  <div className="space-y-2">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(product.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          selectedProduct === product.id ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="font-medium">{product.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Supply Level</h4>
                  <div className="space-y-2">
                    {['all', 'high', 'medium', 'low'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setSupplyFilter(level)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors capitalize font-medium ${
                          supplyFilter === level ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {level === 'all' ? 'All Levels' : level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t mt-4 pt-4">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Share My Price</Button>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-green-50 border-2 border-dashed border-gray-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Nigeria Market Map</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white"><Plus className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" className="bg-white"><Minus className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" className="bg-white"><Navigation className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="w-full h-96 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Interactive map showing real-time market prices</p>
                    <p className="text-sm text-gray-400 mt-2">Prices update every 2 minutes</p>
                  </div>
                </div>
              </Card>

              <div className="flex gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> <span className="text-sm text-gray-700">High Supply</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /> <span className="text-sm text-gray-700">Medium Supply</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> <span className="text-sm text-gray-700">Low Supply</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /> <span className="text-sm text-gray-700">New Report</span></div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Markets in Selected Region</h3>
                <div className="space-y-3">
                  {marketLocations.map((market, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${getSupplyDot(market.supply)}`} />
                          <div>
                            <p className="font-semibold text-gray-900">{market.city}</p>
                            <p className="text-sm text-gray-600">{market.reports} reports</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{market.price}</p>
                          <div className={`inline-flex items-center gap-1 text-xs font-medium mt-1 px-2 py-1 rounded ${getSupplyColor(market.supply)}`}>
                            {market.change.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {market.change}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
