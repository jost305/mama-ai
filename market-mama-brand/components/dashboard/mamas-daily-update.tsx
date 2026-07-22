import { Sun, Bell } from "lucide-react";

export function MamasDailyUpdate() {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-bold text-green-900">Mama&apos;s Daily Update</h2>
          </div>
          <p className="text-sm text-green-800 mb-3">
            Get today&apos;s market update every morning.
          </p>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
            Enable Updates
          </button>
        </div>

        {/* Right side decoration */}
        <div className="hidden sm:flex items-center justify-center">
          <div className="text-5xl">👩‍🌾</div>
        </div>
      </div>
    </div>
  );
}
