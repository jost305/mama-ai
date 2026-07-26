"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";
  return "Good Night";
}

function getGreetingEmoji(greeting: string) {
  if (greeting === "Good Morning") return "🌅";
  if (greeting === "Good Afternoon") return "☀️";
  if (greeting === "Good Evening") return "🌆";
  return "🌙";
}

function AnimatedOrb() {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24">
      {/* Outermost glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-2 rounded-full border border-emerald-200/50 dark:border-emerald-700/40"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
      {/* Core orb */}
      <motion.div
        className="relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center overflow-hidden"
        style={{
          background: "radial-gradient(circle at 35% 35%, #34d399, #059669 50%, #065f46 100%)",
          boxShadow: "0 0 24px rgba(16,185,129,0.5), 0 0 8px rgba(16,185,129,0.3) inset",
        }}
        animate={{
          boxShadow: [
            "0 0 24px rgba(16,185,129,0.5), 0 0 8px rgba(16,185,129,0.3) inset",
            "0 0 40px rgba(16,185,129,0.7), 0 0 16px rgba(16,185,129,0.5) inset",
            "0 0 24px rgba(16,185,129,0.5), 0 0 8px rgba(16,185,129,0.3) inset",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Shimmer highlight */}
        <motion.div
          className="absolute top-2 left-3 w-4 h-4 rounded-full bg-white/30 blur-sm"
          animate={{ opacity: [0.4, 0.8, 0.4], x: [-1, 1, -1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Inner sparkle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-2 h-2 rounded-full bg-white/60"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}

const suggestedPrompts = [
  { emoji: "🍅", title: "Current tomato prices", sub: "in Lagos markets today" },
  { emoji: "📍", title: "Find textile markets", sub: "near Kumasi, Ghana" },
  { emoji: "📊", title: "Compare maize prices", sub: "across Nairobi vendors" },
  { emoji: "🚨", title: "Alert when palm oil", sub: "drops below ₦18,000" },
];

export const Overview = () => {
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    // Update greeting every minute
    const interval = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-8 md:mt-12 mx-4 md:mx-0 w-full"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col items-center gap-5 text-center">
        {/* Animated Orb */}
        <AnimatedOrb />

        {/* Greeting */}
        <div>
          <motion.h1
            className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {getGreetingEmoji(greeting)} {greeting}!
          </motion.h1>
          <motion.p
            className="mt-1.5 text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            How can I assist you today?
          </motion.p>
        </div>

        {/* Suggested prompts */}
        <motion.div
          className="w-full grid grid-cols-2 gap-1.5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {suggestedPrompts.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer group"
            >
              <span className="text-base leading-none flex-shrink-0">{item.emoji}</span>
              <div className="text-left min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{item.title}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};
