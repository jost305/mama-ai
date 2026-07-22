'use client';

import { Button } from '@/components/ui/button';

export default function MarketScoutsPage() {
  return (
    <section className="bg-gray-50 py-6">
      <div className="px-4 max-w-4xl mx-auto">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-600">
            Market Scouts
          </p>
          <h1 className="mt-2 text-xl font-semibold text-gray-900">
            Empower your network of Market Scouts.
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Track performance, review verified reports, and keep field intelligence fresh with compact scout analytics.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 p-3">
              <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-700">Total Scouts</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">8,742</p>
              <p className="mt-1 text-[11px] text-gray-500">+15.4% vs last month</p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-3">
              <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">Active This Week</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">5,218</p>
              <p className="mt-1 text-[11px] text-gray-500">+22.7% vs last week</p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-3">
              <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">Reports This Week</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">12,450</p>
              <p className="mt-1 text-[11px] text-gray-500">+18.6% vs last week</p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-3">
              <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">Avg. Trust</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">92%</p>
              <p className="mt-1 text-[11px] text-gray-500">+3% vs last month</p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-[11px] uppercase tracking-[0.22em] text-gray-500">
                <tr>
                  <th className="px-3 py-2">Scout</th>
                  <th className="px-3 py-2">Level</th>
                  <th className="px-3 py-2">Markets</th>
                  <th className="px-3 py-2">Reports</th>
                  <th className="px-3 py-2">Trust</th>
                  <th className="px-3 py-2">Earnings</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {[
                  { name: 'Maryam Abubakar', phone: '0803 123 4567', level: 'Market Captain', markets: 'Mile 12, Balogun, Oyingbo', reports: 482, trust: '98%', earnings: '₦84,750', status: 'Active' },
                  { name: 'Chinedu Okafor', phone: '0812 345 6789', level: 'Senior Scout', markets: 'Onitsha Main, Ariaria', reports: 356, trust: '94%', earnings: '₦61,200', status: 'Active' },
                  { name: 'Aisha Bello', phone: '0706 789 0123', level: 'Senior Scout', markets: 'Comput. Village, Ikeja', reports: 298, trust: '92%', earnings: '₦48,600', status: 'Active' },
                  { name: 'Emeka Nwosu', phone: '0810 222 3344', level: 'Scout', markets: 'Mile 12', reports: 215, trust: '90%', earnings: '₦31,450', status: 'Active' },
                ].map((scout, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">{scout.name.split(' ').map((n) => n[0]).join('')}</div>
                        <div>
                          <p className="font-medium text-gray-900">{scout.name}</p>
                          <p className="text-xs text-gray-500">{scout.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-600">{scout.level}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-600">{scout.markets}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-600">{scout.reports}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-600">{scout.trust}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-600">{scout.earnings}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${scout.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                        {scout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
