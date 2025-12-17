import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../../lib/theme';

export const GlitchText = ({ text, color = "text-cyan-400", size = "text-2xl" }: { text: string, color?: string, size?: string }) => (
  <div className={`relative inline-block ${theme.heading} ${size} ${color} group`}>
    <span className="relative z-10">{text}</span>
    <span className="absolute top-0 left-0 -ml-0.5 translate-x-[2px] text-red-500 opacity-70 animate-pulse hidden group-hover:block">{text}</span>
    <span className="absolute top-0 left-0 -ml-0.5 -translate-x-[2px] text-blue-500 opacity-70 animate-pulse delay-75 hidden group-hover:block">{text}</span>
  </div>
);

export const NeonCard = ({ children, className = "", glow = "cyan" }: { children: React.ReactNode, className?: string, glow?: "cyan" | "purple" | "pink" | "none" }) => {
  let glowClass = "";
  if (glow === "cyan") glowClass = "hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] border-cyan-900/50";
  if (glow === "purple") glowClass = "hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] border-purple-900/50";
  if (glow === "pink") glowClass = "hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] border-pink-900/50";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl bg-[#131b2e] border ${glowClass} backdrop-blur-sm p-4 ${className}`}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20" />
      {children}
    </motion.div>
  );
};
