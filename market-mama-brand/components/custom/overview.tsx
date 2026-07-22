import { motion } from "framer-motion";
import Image from "next/image";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[480px] mt-12 mx-4 md:mx-0 w-full"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Image
          src="/logo.png"
          width={52}
          height={52}
          alt="MamaPrice"
          className="rounded-xl object-contain"
        />
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Welcome to MamaPrice
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm">
            AI-powered market intelligence for African traders and buyers.
            Ask about prices, vendors, or markets.
          </p>
        </div>

        <div className="w-full grid grid-cols-2 gap-1.5">
          {[
            { emoji: "🥦", title: "Current tomato prices", sub: "in Lagos markets today" },
            { emoji: "📍", title: "Find textile markets", sub: "near Kumasi, Ghana" },
            { emoji: "📊", title: "Compare maize prices", sub: "across Nairobi vendors" },
            { emoji: "🚨", title: "Alert me when palm oil", sub: "drops below ₦18,000" },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700"
            >
              <span className="text-base leading-none flex-shrink-0">{item.emoji}</span>
              <div className="text-left min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-tight">{item.title}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
