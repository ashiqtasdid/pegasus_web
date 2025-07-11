/* eslint-disable @next/next/no-page-custom-font, @next/next/no-sync-scripts */
'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Rocket } from 'lucide-react';
import Head from 'next/head';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import ComparisonTable from '@/components/ComparisonTable';

// Type for session
type Session = {
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
} | null;

// Icon Component
interface IconProps {
  type: 'check' | 'cross' | 'star' | 'github' | 'twitter' | 'discord';
  className?: string;
}

const Icon: React.FC<IconProps> = ({ type, className = '' }) => {
  switch (type) {
    case 'check':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-blue-400 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'cross':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-red-400 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'star':
       return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-yellow-400 ${className}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
       );
    case 'github':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
      );
    case 'twitter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      );
    case 'discord':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20.222 5.587A13.89 13.89 0 0 0 15.655 4H8.344C5.122 4 4 5.122 4 8.344v7.311c0 3.233 1.122 4.345 4.344 4.345h.345c.2 0 .378.145.422.345.144.6.433 1.189.789 1.711.211.322.5.5.822.5s.611-.178.822-.5c.356-.522.645-1.111.789-1.711.045-.2.222-.345.422-.345h.689c.2 0 .378.145.422.345.144.6.433 1.189.789 1.711.211.322.5.5.822.5s.611-.178.822-.5c.356-.522.645-1.111.789-1.711.045-.2.222-.345.422-.345h.345c3.222 0 4.344-1.122 4.344-4.344V8.344c0-1.711-.7-2.9-2.123-2.757zm-6.889 6.889H11.2v-2.133h2.133v2.133zm-4.344 0H6.856v-2.133h2.133v2.133z"/></svg>
      );
    default:
      return null;
  }
};

// Header Component
const Header: React.FC<{ 
  onSignInClick: () => void; 
  session: Session; 
  onDashboardClick: () => void; 
}> = ({ onSignInClick, session, onDashboardClick }) => {
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F1F]/80 backdrop-blur-sm border-b border-slate-800/50" 
      role="banner"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center" role="navigation" aria-label="Main navigation">
        <motion.div 
          className="text-xl font-bold text-white cursor-pointer"
          whileHover={{ color: "#60A5FA" }}
          transition={{ duration: 0.2 }}
        >
          <h1>Moonlit AI</h1>
        </motion.div>
        <ul className="hidden md:flex items-center space-x-8" role="list">
          <motion.li whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <motion.a 
              href="#features" 
              className="text-slate-300" 
              aria-label="View product features"
              whileHover={{ color: "#FFFFFF" }}
            >
              Features
            </motion.a>
          </motion.li>
          <motion.li whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <motion.a 
              href="#faq" 
              className="text-slate-300" 
              aria-label="Frequently asked questions"
              whileHover={{ color: "#FFFFFF" }}
            >
              FAQ
            </motion.a>
          </motion.li>
          <motion.li whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <motion.a 
              href="#comparison" 
              className="text-slate-300" 
              aria-label="Product comparison"
              whileHover={{ color: "#FFFFFF" }}
            >
              Comparison
            </motion.a>
          </motion.li>
          <motion.li whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <motion.a 
              href="#waitlist" 
              className="text-slate-300" 
              aria-label="Get early access"
              whileHover={{ color: "#FFFFFF" }}
            >
              Get Started
            </motion.a>
          </motion.li>
        </ul>
        {session ? (
          <motion.button 
            onClick={onDashboardClick} 
            className="hidden md:block bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg" 
            aria-label="Go to dashboard"
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: "#1D4ED8",
              boxShadow: "0 10px 25px rgba(59, 130, 246, 0.25)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Go to Dashboard
          </motion.button>
        ) : (
          <motion.button 
            onClick={onSignInClick} 
            className="hidden md:block bg-white text-slate-900 font-semibold px-4 py-2 rounded-lg" 
            aria-label="Sign in to account"
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: "#E2E8F0",
              boxShadow: "0 10px 25px rgba(255, 255, 255, 0.25)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Sign In
          </motion.button>
        )}
      </nav>
    </motion.header>
  );
};

// Hero Component
const BackgroundShape: React.FC<{ className?: string; delay?: number }> = ({ className, delay = 0 }) => {
  return (
    <motion.div 
      className={`absolute bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-cyan-500/15 w-64 h-64 rounded-full filter blur-3xl ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: [0.6, 1, 0.6],
        scale: [0.8, 1.1, 0.8],
        y: [-20, 20, -20]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay: delay / 1000,
        ease: "easeInOut"
      }}
    />
  )
}

const ParticleField: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main particles */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? 'rgba(59, 130, 246, 0.4)' : 
                       i % 3 === 1 ? 'rgba(139, 92, 246, 0.3)' : 'rgba(6, 182, 212, 0.3)',
            boxShadow: i % 4 === 0 ? '0 0 10px currentColor' : 'none'
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Floating geometric shapes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`shape-${i}`}
          className="absolute opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            y: [-10, 10, -10],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        >
          {i % 3 === 0 ? (
            <div className="w-6 h-6 border border-blue-400/30 rotate-45" />
          ) : i % 3 === 1 ? (
            <div className="w-8 h-8 border-2 border-purple-400/20 rounded-full" />
          ) : (
            <div className="w-4 h-8 bg-cyan-400/10 transform rotate-12" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

const Hero: React.FC<{ 
  onGetStartedClick: () => void; 
  session: Session; 
  onDashboardClick: () => void; 
}> = ({ onGetStartedClick, session, onDashboardClick }) => {
  // Typing animation for the prompt text
  const promptText = "Transform your Minecraft server with professional custom plugins in under 30 seconds. Describe your plugin idea in plain English, and our advanced AI instantly generates production-ready, secure, and optimized code compatible with Spigot, Paper, Bukkit, and Purpur. No Java programming skills or development setup required.";
  const [typedPrompt, setTypedPrompt] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [promptDone, setPromptDone] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!promptDone && promptIndex < promptText.length) {
      timeout = setTimeout(() => {
        setTypedPrompt((prev) => prev + promptText[promptIndex]);
        setPromptIndex((prev) => prev + 1);
      }, 18);
    } else if (promptIndex === promptText.length) {
      setPromptDone(true);
    }
    return () => clearTimeout(timeout);
  }, [promptIndex, promptDone, promptText]);

  return (
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden pt-20" role="banner">
      <ParticleField />
      
      {/* Enhanced animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1F] via-[#1E293B]/50 to-[#0A0F1F]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1F] via-transparent to-transparent"></div>
      
      {/* Animated gradient orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full filter blur-3xl opacity-60"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.8, 0.6]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full filter blur-3xl opacity-40"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          delay: 1,
          ease: "easeInOut"
        }}
      />
      
      {/* Enhanced background shapes */}
      <BackgroundShape className="top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2" delay={0} />
      <BackgroundShape className="bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2" delay={2000} />
      <BackgroundShape className="top-1/2 right-1/3 transform translate-x-1/2 -translate-y-1/2 w-32 h-32" delay={4000} />
      <BackgroundShape className="bottom-1/3 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-48 h-48" delay={6000} />

      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0F1F]/30 to-[#0A0F1F] pointer-events-none"></div>

      <div className="container mx-auto px-6 z-10 relative">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm font-medium backdrop-blur-sm mb-6 card-glass" 
            role="banner"
            whileHover={{ 
              background: "linear-gradient(to right, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))"
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="w-2 h-2 bg-green-400 rounded-full mr-3 shadow-lg shadow-green-400/50" 
              aria-hidden="true"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent font-semibold">AI-Powered Minecraft Plugin Generator</span>
          </motion.div>
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-7xl font-extrabold leading-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent" 
          style={{ minHeight: '4.5em' }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          Generate Professional<br />Minecraft Plugins with{" "}
          <motion.span 
            className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ["0%", "100%", "0%"] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            style={{ backgroundSize: "200% 200%" }}
          >
            AI Technology
          </motion.span>
        </motion.h1>
        
        <motion.p 
          className="mt-6 max-w-2xl mx-auto text-lg text-slate-300 leading-relaxed" 
          style={{ minHeight: '3.5em', position: 'relative' }} 
          role="doc-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          {typedPrompt}
          {!promptDone && (
            <motion.span 
              className="inline-block w-2 h-6 bg-gradient-to-t from-blue-400 to-purple-400 align-middle ml-1 shadow-lg shadow-blue-400/50" 
              style={{ verticalAlign: 'middle', position: 'absolute' }} 
              aria-hidden="true"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.p>
        
        <motion.div 
          className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4" 
          role="group" 
          aria-label="Primary actions"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          {session ? (
            <motion.button
              onClick={onDashboardClick}
              className="group relative w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-8 py-4 rounded-xl overflow-hidden"
              aria-label="Access your dashboard"
              whileHover={{ 
                scale: 1.05,
                background: "linear-gradient(to right, #1D4ED8, #1E40AF)",
                boxShadow: "0 20px 40px rgba(59, 130, 246, 0.25)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Go to Dashboard
                <motion.svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  aria-hidden="true"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
            </motion.button>
          ) : (
            <motion.button
              onClick={onGetStartedClick}
              className="group relative w-full sm:w-auto bg-gradient-to-r from-white to-slate-100 text-slate-900 font-semibold px-8 py-4 rounded-xl overflow-hidden"
              aria-label="Start creating Minecraft plugins for free"
              whileHover={{ 
                scale: 1.05,
                background: "linear-gradient(to right, #E2E8F0, #FFFFFF)",
                boxShadow: "0 20px 40px rgba(255, 255, 255, 0.25)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Creating Plugins Free
                <motion.svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  aria-hidden="true"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
            </motion.button>
          )}
          <motion.a
            href="#features"
            className="group relative w-full sm:w-auto bg-transparent border border-slate-600 text-white font-semibold px-8 py-4 rounded-xl backdrop-blur-sm card-glass"
            aria-label="Learn more about features"
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "rgba(30, 41, 59, 0.5)",
              borderColor: "#64748B",
              boxShadow: "0 20px 40px rgba(100, 116, 139, 0.25)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Learn More
              <motion.svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                aria-hidden="true"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </motion.svg>
            </span>
          </motion.a>
        </motion.div>

        {/* Enhanced floating elements */}
        <motion.div 
          className="absolute top-1/4 left-10 w-6 h-6 border border-blue-400/30 rounded rotate-45" 
          aria-hidden="true"
          animate={{ 
            y: [-10, 10, -10],
            rotate: [45, 135, 45],
            borderColor: ["rgba(96, 165, 250, 0.3)", "rgba(96, 165, 250, 0.6)", "rgba(96, 165, 250, 0.3)"]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-16 w-4 h-4 bg-purple-400/20 rounded-full" 
          aria-hidden="true"
          animate={{ 
            y: [10, -10, 10],
            backgroundColor: ["rgba(196, 181, 253, 0.2)", "rgba(196, 181, 253, 0.4)", "rgba(196, 181, 253, 0.2)"]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 right-20 w-8 h-8 border-2 border-cyan-400/20 rounded-full" 
          aria-hidden="true"
          animate={{ 
            scale: [1, 1.2, 1],
            borderColor: ["rgba(34, 211, 238, 0.2)", "rgba(34, 211, 238, 0.4)", "rgba(34, 211, 238, 0.2)"]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </section>
  );
};

// Showcase Component
const Showcase: React.FC = () => {
  type ShowcaseTab = 'simple' | 'custom' | 'complex';

  const showcaseData = {
    simple: {
      label: 'Basic Commands',
      filename: 'GiftCommand.java',
      code: `# User Request:
> "Create a plugin that gives players a diamond when they type /gift"

# Moonlit AI Processing...
# ✅ Generated in 8.2 seconds

# Generated plugin.yml:
name: GiftDiamond
version: 1.0.0
main: com.pegasus.giftdiamond.GiftDiamond
author: PegasusAI
api-version: 1.19
commands:
  gift:
    description: Gives the player a diamond item
    usage: /<command>
    permission: giftdiamond.use

# Generated Java code (optimized & secure):
@Override
public boolean onCommand(CommandSender sender, Command cmd, String label, String[] args) {
    if (!(sender instanceof Player)) {
        sender.sendMessage("§cOnly players can use this command!");
        return true;
    }
    
    Player player = (Player) sender;
    player.getInventory().addItem(new ItemStack(Material.DIAMOND));
    player.sendMessage("§aYou received a diamond!");
    return true;
}`
    },
    custom: {
      label: 'Advanced Items',
      filename: 'ZeusBolt.java',
      code: `# User Request:
> "Create a custom sword named 'Zeus's Bolt' that strikes lightning when it hits enemies"

# Moonlit AI Processing...
# ✅ Generated in 12.7 seconds

# Generated advanced weapon system:
@EventHandler
public void onEntityDamageByEntity(EntityDamageByEntityEvent event) {
    if (!(event.getDamager() instanceof Player)) return;
    
    Player player = (Player) event.getDamager();
    ItemStack weapon = player.getInventory().getItemInMainHand();
    
    if (weapon.hasItemMeta() && weapon.getItemMeta().hasDisplayName()) {
        String displayName = weapon.getItemMeta().getDisplayName();
        
        if (ChatColor.stripColor(displayName).equals("Zeus's Bolt")) {
            Entity target = event.getEntity();
            World world = target.getWorld();
            
            // Strike lightning with safety checks
            world.strikeLightning(target.getLocation());
            
            // Add particle effects
            world.spawnParticle(Particle.ELECTRIC_SPARK, 
                target.getLocation(), 20, 0.5, 1, 0.5);
            
            // Custom damage calculation
            event.setDamage(event.getDamage() * 1.5);
            
            player.sendMessage("§e⚡ Zeus's power courses through your weapon!");
        }
    }
}`
    },
    complex: {
      label: 'Game Systems',
      filename: 'CaptureTheFlag.java',
      code: `# User Request:
> "Create a capture the flag game mode with teams, flags, and scoring system"

# Moonlit AI Processing...
# ✅ Generated in 24.1 seconds

# Generated complete game system:
public class CaptureTheFlagGame extends JavaPlugin {
    private Map<String, CTFTeam> teams = new HashMap<>();
    private Map<Location, Flag> flags = new HashMap<>();
    private GameState gameState = GameState.WAITING;
    private int gameTimer = 0;
    
    public enum GameState {
        WAITING, STARTING, ACTIVE, ENDING
    }
    
    @EventHandler
    public void onPlayerInteract(PlayerInteractEvent event) {
        if (gameState != GameState.ACTIVE) return;
        
        Block block = event.getClickedBlock();
        if (block == null) return;
        
        Flag flag = flags.get(block.getLocation());
        if (flag == null) return;
        
        Player player = event.getPlayer();
        CTFTeam playerTeam = getPlayerTeam(player);
        
        if (playerTeam != null && !flag.getTeam().equals(playerTeam)) {
            captureFlag(player, flag);
        }
    }
    
    private void captureFlag(Player player, Flag flag) {
        CTFTeam team = getPlayerTeam(player);
        team.addScore(1);
        
        // Broadcast capture message
        Bukkit.broadcastMessage(String.format(
            "§6%s §fcaptured the §%s%s §fflag! Score: §a%d", 
            player.getName(), 
            flag.getTeam().getColor(), 
            flag.getTeam().getName(),
            team.getScore()
        ));
        
        // Check win condition
        if (team.getScore() >= 3) {
            endGame(team);
        }
        
        // Reset flag position
        flag.resetPosition();
    }
}`
    },
  };

  const [activeTab, setActiveTab] = useState<ShowcaseTab>('simple');
  const [codeVisible, setCodeVisible] = useState(false);
  const [typedCode, setTypedCode] = useState('');
  const [codeIndex, setCodeIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const activeShowcase = showcaseData[activeTab];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setCodeVisible(true);
        setIsTyping(true);
        setTypedCode('');
        setCodeIndex(0);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  // Typing animation for code
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isTyping && codeVisible && codeIndex < activeShowcase.code.length) {
      timeout = setTimeout(() => {
        setTypedCode((prev) => prev + activeShowcase.code[codeIndex]);
        setCodeIndex((prev) => prev + 1);
      }, 8); // Faster typing for code
    } else if (codeIndex >= activeShowcase.code.length) {
      setIsTyping(false);
    }
    return () => clearTimeout(timeout);
  }, [isTyping, codeVisible, codeIndex, activeShowcase.code]);

  // Reset typing when tab changes
  useEffect(() => {
    if (codeVisible) {
      setIsTyping(true);
      setTypedCode('');
      setCodeIndex(0);
    }
  }, [activeTab, codeVisible]);

  return (
    <motion.section 
      className="py-20 sm:py-32"
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-extrabold text-white"
            initial={{ y: 50, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            See Moonlit AI in Action
          </motion.h2>
          <motion.p 
            className="mt-4 text-lg text-slate-300"
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Watch how our AI transforms simple descriptions into production-ready Minecraft plugins. From basic commands to complex game mechanics.
          </motion.p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <motion.div 
            className="flex justify-center space-x-2 sm:space-x-4 mb-8"
            initial={{ y: 40, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {(Object.keys(showcaseData) as ShowcaseTab[]).map((tabKey, index) => (
              <motion.button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`px-6 py-3 text-sm sm:text-base font-semibold rounded-xl ${
                  activeTab === tabKey
                    ? 'bg-gradient-to-r from-white to-slate-100 text-slate-900 shadow-lg shadow-white/25 glow-border'
                    : 'bg-slate-800/50 text-slate-300 border border-slate-600 card-glass'
                }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: activeTab === tabKey ? undefined : "rgba(51, 65, 85, 0.7)",
                  boxShadow: activeTab === tabKey ? "0 20px 50px rgba(255, 255, 255, 0.25)" : "0 10px 25px rgba(71, 85, 105, 0.25)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                {showcaseData[tabKey].label}
              </motion.button>
            ))}
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-[#1E293B] to-[#334155] rounded-2xl border border-slate-700 overflow-hidden shadow-2xl shadow-blue-500/10 card-glass"
            initial={{ y: 60, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            whileHover={{ 
              boxShadow: "0 25px 50px rgba(59, 130, 246, 0.2)",
              scale: 1.02
            }}
          >
            <motion.div 
              className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 px-6 py-4 text-xs text-slate-400 font-mono border-b border-slate-700 flex items-center backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <div className="flex space-x-3 mr-6">
                <motion.div 
                  className="w-3 h-3 rounded-full bg-red-500"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div 
                  className="w-3 h-3 rounded-full bg-yellow-500"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                <motion.div 
                  className="w-3 h-3 rounded-full bg-green-500"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </div>
              <span className="text-slate-300 font-medium">{activeShowcase.filename}</span>
              <div className="ml-auto flex items-center gap-2">
                <motion.div 
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-green-400 text-xs">Live Preview</span>
              </div>
            </motion.div>
            <div className="relative">
              <motion.pre 
                className="p-8 text-sm text-left overflow-x-auto bg-gradient-to-br from-slate-900/50 to-slate-800/30"
                style={{ minHeight: '350px' }}
                initial={{ opacity: 0 }}
                animate={codeVisible ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <code className="font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {typedCode}
                  {isTyping && (
                    <motion.span 
                      className="inline-block w-2 h-5 bg-gradient-to-t from-green-400 to-emerald-300 align-middle ml-1 shadow-lg shadow-green-400/50"
                      style={{ verticalAlign: 'middle' }}
                      aria-hidden="true"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </code>
              </motion.pre>
              
              {/* Code enhancement overlay */}
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <motion.div 
                    className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-md text-xs text-blue-300 font-mono backdrop-blur-sm"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.7, duration: 0.5 }}
                  >
                    Java
                  </motion.div>
                  <motion.div 
                    className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-md text-xs text-green-300 font-mono backdrop-blur-sm"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.9, duration: 0.5 }}
                  >
                    AI Generated
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

// FAQ Component
const FAQ: React.FC = () => {
  const faqData = [
    {
      question: 'What is Moonlit AI and how does it work?',
      answer: "Moonlit AI is an advanced machine learning platform specifically trained on Minecraft plugin development. It uses natural language processing to understand your plugin requirements and generates production-ready Java code compatible with Spigot, Paper, and Bukkit servers. Simply describe your plugin idea in plain English, and our AI handles the complex coding, optimization, and security implementation."
    },
    {
      question: 'How does the AI generate high-quality Minecraft plugins?',
      answer: "Our AI is trained on millions of lines of Minecraft plugin code and best practices. It understands Bukkit/Spigot APIs, common design patterns, security vulnerabilities, and performance optimization techniques. The AI generates clean, well-documented code that follows industry standards, includes error handling, and implements proper permission systems automatically."
    },
    {
      question: 'Which Minecraft versions and server software are supported?',
      answer: "Moonlit AI generates plugins compatible with Minecraft versions 1.16 through 1.20+, supporting Spigot, Paper, Purpur, and other Bukkit-based server software. Our AI automatically selects the appropriate API methods and ensures backward compatibility when possible. We continuously update our training data to support the latest Minecraft releases."
    },
    {
      question: 'Do I need programming knowledge to create plugins with Pegasus?',
      answer: "Absolutely not! Moonlit AI is designed for everyone - from server owners with zero coding experience to experienced developers looking to accelerate their workflow. Simply describe your plugin functionality in natural language, and our AI handles all the technical implementation. However, basic Minecraft server administration knowledge is helpful for plugin deployment."
    },
    {
      question: 'Can I modify and customize the generated plugin code?',
      answer: "Yes! Every plugin generated by Moonlit AI comes with full source code access. You receive well-organized, commented Java files that you can modify, extend, or integrate with existing systems. Our code follows standard Java conventions, making it easy for developers to understand and customize according to their specific needs."
    },
    {
      question: 'What does the free tier include and how does pricing work?',
      answer: "Our free tier includes 100,000 AI tokens, enough to generate 15-25 medium-complexity plugins. This lets you fully evaluate Moonlit AI's capabilities before upgrading. Our Pro plan offers unlimited plugin generation, priority support, advanced customization options, and early access to new features. Enterprise plans include custom training and dedicated support."
    },
    {
      question: 'How secure and reliable are the generated plugins?',
      answer: "Security is our top priority. Our AI is trained to implement proper input validation, permission checks, and secure coding practices. Generated plugins include built-in protection against common vulnerabilities like SQL injection, command injection, and resource exhaustion. All code undergoes automated security scanning before delivery."
    },
    {
      question: 'Can I deploy plugins directly to my server from Pegasus?',
      answer: "Yes! Our one-click deployment feature allows you to upload plugins directly to your server via SFTP, FTP, or our server integration API. We also provide detailed installation guides and can generate server configuration files when needed. For security, we recommend testing plugins on a staging server first."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const FaqItem: React.FC<{
    item: { question: string; answer: string };
    isOpen: boolean;
    onClick: () => void;
    index: number;
    isInView: boolean;
  }> = ({ item, isOpen, onClick, index, isInView }) => {
    return (
      <motion.div 
        className="group border-b border-slate-700 py-6 rounded-lg px-4"
        initial={{ y: 50, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        whileHover={{ backgroundColor: "rgba(30, 41, 59, 0.2)", x: 8 }}
      >
        <motion.button
          onClick={onClick}
          className="w-full flex justify-between items-center text-left"
          aria-expanded={isOpen}
          whileHover={{ color: "#93c5fd" }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-lg font-medium text-white pr-4">{item.question}</span>
          <motion.div 
            className={`flex-shrink-0 p-2 rounded-full ${isOpen ? 'bg-blue-500/20' : 'bg-slate-700/50'}`}
            animate={{ 
              rotate: isOpen ? 45 : 0,
              backgroundColor: isOpen ? "rgba(59, 130, 246, 0.2)" : "rgba(51, 65, 85, 0.5)"
            }}
            whileHover={{ backgroundColor: "rgba(71, 85, 105, 0.5)" }}
            transition={{ duration: 0.5 }}
          >
            <motion.svg
              className={`w-5 h-5 ${isOpen ? 'text-blue-400' : 'text-slate-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              animate={{ color: isOpen ? "#60a5fa" : "#94a3b8" }}
              whileHover={{ color: "#cbd5e1" }}
              transition={{ duration: 0.3 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m-6-6h12"></path>
            </motion.svg>
          </motion.div>
        </motion.button>
        <motion.div
          initial={false}
          animate={{
            height: isOpen ? "auto" : 0,
            opacity: isOpen ? 1 : 0
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <motion.div 
            className="pt-6"
            animate={{ x: isOpen ? 8 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.p 
              className="text-slate-300 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.3, delay: isOpen ? 0.2 : 0 }}
            >
              {item.answer}
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <motion.section 
      id="faq" 
      className="py-20 sm:py-32"
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-extrabold text-white"
            initial={{ y: 50, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p 
            className="mt-4 text-lg text-slate-300"
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Everything you need to know about Moonlit AI, plugin generation, and getting started with AI-powered Minecraft development.
          </motion.p>
        </div>

        <motion.div 
          className="mt-16 max-w-3xl mx-auto"
          initial={{ y: 60, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {faqData.map((item, index) => (
            <FaqItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onClick={() => handleClick(index)}
              index={index}
              isInView={isInView}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

// Waitlist Component
const Waitlist: React.FC<{ onSignInClick: () => void }> = ({ onSignInClick }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section 
      id="waitlist" 
      className="py-20 sm:py-32 relative overflow-hidden"
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background enhancement */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
      <motion.div 
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 
            className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent"
            initial={{ y: 50, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Start Building Amazing Plugins Today
          </motion.h2>
          <motion.p 
            className="mt-6 text-xl text-slate-300 leading-relaxed"
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Join over 15,000 developers already using Moonlit AI to transform their Minecraft servers. Get started with 100,000 free tokens - no credit card required.
          </motion.p>

          <motion.div 
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ y: 40, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              onClick={onSignInClick}
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-10 py-4 rounded-xl overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                background: "linear-gradient(to right, #1d4ed8, #7c3aed)",
                boxShadow: "0 25px 50px rgba(59, 130, 246, 0.25)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Creating Plugins Free
                <motion.svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  aria-hidden="true"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
            
            <motion.div 
              className="flex items-center gap-3 text-slate-400"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex -space-x-2">
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-slate-800"
                  whileHover={{ scale: 1.1, z: 10 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-slate-800"
                  whileHover={{ scale: 1.1, z: 10 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full border-2 border-slate-800"
                  whileHover={{ scale: 1.1, z: 10 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <span className="text-sm">Join 15,000+ developers worldwide</span>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="mt-8 flex justify-center gap-8 text-sm text-slate-500"
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ color: "#10b981" }}
              transition={{ duration: 0.2 }}
            >
              <motion.svg 
                className="w-4 h-4 text-green-400" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </motion.svg>
              Free 100k tokens
            </motion.div>
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ color: "#10b981" }}
              transition={{ duration: 0.2 }}
            >
              <motion.svg 
                className="w-4 h-4 text-green-400" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </motion.svg>
              No credit card required
            </motion.div>
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ color: "#10b981" }}
              transition={{ duration: 0.2 }}
            >
              <motion.svg 
                className="w-4 h-4 text-green-400" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </motion.svg>
              Instant access
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

// Footer Component
const Footer: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const linkVariants = {
    hover: {
      color: "#ffffff",
      x: 4,
      transition: { duration: 0.3 }
    }
  };

  const iconVariants = {
    hover: {
      scale: 1.1,
      color: "#ffffff",
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.footer 
      className="bg-slate-900/50 border-t border-slate-800" 
      role="contentinfo"
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="container mx-auto px-6 py-12"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div 
            className="col-span-1 md:col-span-1"
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.h3 
              className="text-xl font-bold text-white"
              whileHover={{ color: "#60a5fa" }}
              transition={{ duration: 0.3 }}
            >
              Moonlit AI
            </motion.h3>
            <p className="mt-2 text-slate-400 text-sm">AI-powered Minecraft plugin generator for developers and server owners worldwide.</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 col-span-1 md:col-span-3 gap-8">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3" role="list">
                <li>
                  <motion.a 
                    href="#features" 
                    className="text-slate-400" 
                    aria-label="View product features"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    Features
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="/pricing" 
                    className="text-slate-400" 
                    aria-label="View pricing plans"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    Pricing
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="/docs" 
                    className="text-slate-400" 
                    aria-label="Read documentation"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    Documentation
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="/api" 
                    className="text-slate-400" 
                    aria-label="API reference"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    API Reference
                  </motion.a>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3" role="list">
                <li>
                  <motion.a 
                    href="/about" 
                    className="text-slate-400" 
                    aria-label="About Moonlit AI"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    About
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="/blog" 
                    className="text-slate-400" 
                    aria-label="Read our blog"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    Blog
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="/careers" 
                    className="text-slate-400" 
                    aria-label="Join our team"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    Careers
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="/contact" 
                    className="text-slate-400" 
                    aria-label="Contact us"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    Contact
                  </motion.a>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <ul className="space-y-3" role="list">
                <li>
                  <motion.a 
                    href="https://github.com/pegasus-ai" 
                    className="text-slate-400" 
                    aria-label="Follow us on GitHub" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    GitHub
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="https://twitter.com/PegasusAI" 
                    className="text-slate-400" 
                    aria-label="Follow us on Twitter" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    Twitter
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="https://discord.gg/pegasus" 
                    className="text-slate-400" 
                    aria-label="Join our Discord community" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    Discord
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="/support" 
                    className="text-slate-400" 
                    aria-label="Get support"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    Support
                  </motion.a>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.div>
      <motion.div 
        className="container mx-auto px-6 py-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-sm"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <p className="text-slate-400">
          © 2024 Moonlit AI, Inc. All rights reserved. | 
          <motion.a 
            href="/privacy" 
            className="hover:text-white transition-colors ml-1"
            whileHover={{ color: "#ffffff" }}
          >
            Privacy Policy
          </motion.a> | 
          <motion.a 
            href="/terms" 
            className="hover:text-white transition-colors ml-1"
            whileHover={{ color: "#ffffff" }}
          >
            Terms of Service
          </motion.a>
        </p>
        <div className="flex space-x-4 mt-4 sm:mt-0" role="list">
          <motion.a 
            href="https://github.com/pegasus-ai" 
            className="text-slate-400" 
            aria-label="GitHub" 
            target="_blank" 
            rel="noopener noreferrer"
            variants={iconVariants}
            whileHover="hover"
          >
            <Icon type="github" className="w-5 h-5"/>
          </motion.a>
          <motion.a 
            href="https://twitter.com/PegasusAI" 
            className="text-slate-400" 
            aria-label="Twitter" 
            target="_blank" 
            rel="noopener noreferrer"
            variants={iconVariants}
            whileHover="hover"
          >
            <Icon type="twitter" className="w-5 h-5"/>
          </motion.a>
          <motion.a 
            href="https://discord.gg/pegasus" 
            className="text-slate-400" 
            aria-label="Discord" 
            target="_blank" 
            rel="noopener noreferrer"
            variants={iconVariants}
            whileHover="hover"
          >
            <Icon type="discord" className="w-5 h-5"/>
          </motion.a>
        </div>
      </motion.div>
    </motion.footer>
  );
};

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Check if we're in development mode - use NEXT_PUBLIC_ prefix for client-side access
  const isDevelopmentMode = process.env.NEXT_PUBLIC_DEVELOP === 'true';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isPending) {
      // Landing page should ALWAYS show - no automatic redirects
      // Users can manually navigate to dashboard via header or buttons if logged in
    }
  }, [session, isPending, router, mounted]);

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleDashboard = () => {
    router.push('/dashboard');
  };

  // Show loading state while checking authentication
  if (!mounted || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0F1F] via-[#0A0F1F] to-slate-900/20">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Rocket className="h-16 w-16 text-blue-400 mr-4" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Pegasus
            </h1>
          </div>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-slate-300">Loading...</p>
          <p className="text-xs text-slate-500 mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // DEBUG: Show auth state in development
  if (mounted && !isPending && isDevelopmentMode) {
    console.log('AUTH DEBUG:', {
      session,
      isAuthenticated: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
  }

  // Show landing page for unauthenticated users
  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>Moonlit AI - Generate Minecraft Plugins Instantly with AI | No Code Required</title>
        <meta name="title" content="Moonlit AI - Generate Minecraft Plugins Instantly with AI | No Code Required" />
        <meta name="description" content="Create professional Minecraft plugins in seconds using AI. Just describe your plugin in plain English and get production-ready Spigot, Paper & Bukkit plugins instantly. Free 100K tokens to start." />
        <meta name="keywords" content="minecraft plugins, ai plugin generator, spigot plugins, paper plugins, bukkit plugins, minecraft server, plugin development, no code minecraft, ai coding, minecraft automation, java plugin generator, minecraft ai tools, server management, bukkit development, spigot api, minecraft modding, game server plugins, artificial intelligence minecraft" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="author" content="Moonlit AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Additional Technical SEO */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#0A0F1F" />
        <meta name="application-name" content="Moonlit AI" />
        <meta name="apple-mobile-web-app-title" content="Moonlit AI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="origin-when-cross-origin" />
        
        {/* Performance and Caching */}
        <meta httpEquiv="Cache-Control" content="public, max-age=31536000" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" as="style" />
        
        {/* OpenGraph Extended */}
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:alt" content="Moonlit AI - AI-powered Minecraft plugin generator interface" />
        <meta property="article:author" content="Moonlit AI" />
        <meta property="article:publisher" content="https://pegasus.ai" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pegasus.ai/" />
        <meta property="og:title" content="Moonlit AI - Generate Minecraft Plugins Instantly with AI" />
        <meta property="og:description" content="Create professional Minecraft plugins in seconds using AI. Just describe your plugin in plain English and get production-ready code instantly." />
        <meta property="og:image" content="https://pegasus.ai/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Moonlit AI" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://pegasus.ai/" />
        <meta property="twitter:title" content="Moonlit AI - Generate Minecraft Plugins Instantly with AI" />
        <meta property="twitter:description" content="Create professional Minecraft plugins in seconds using AI. Just describe your plugin in plain English and get production-ready code instantly." />
        <meta property="twitter:image" content="https://pegasus.ai/twitter-image.jpg" />
        <meta property="twitter:creator" content="@PegasusAI" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://pegasus.ai/" />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Sitemap and Search Console */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <meta name="google-site-verification" content="pegasus-ai-verification-code" />
        
        {/* Additional SEO Links */}
        <link rel="alternate" type="application/rss+xml" title="Moonlit AI Blog" href="/blog/rss.xml" />
        <link rel="search" type="application/opensearchdescription+xml" title="Moonlit AI Search" href="/opensearch.xml" />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Moonlit AI",
              "url": "https://pegasus.ai",
              "logo": "https://pegasus.ai/logo.png",
              "description": "AI-powered Minecraft plugin generator that creates professional plugins instantly from natural language descriptions.",
              "foundingDate": "2024",
              "sameAs": [
                "https://twitter.com/PegasusAI",
                "https://github.com/pegasus-ai",
                "https://discord.gg/pegasus"
              ]
            })
          }}
        />
        
        {/* Structured Data - WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Moonlit AI",
              "url": "https://pegasus.ai",
              "description": "AI-powered Minecraft plugin generator that creates professional plugins instantly from natural language descriptions.",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web Browser",
              "offers": {
               
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Free tier with 100,000 tokens"
              },
              "featureList": [
                "Natural language plugin generation",
                "Spigot, Paper, and Bukkit compatibility",
                "Instant plugin creation",
                "No coding required",
                "Production-ready code",
                "One-click deployment"
              ]
            })
          }}
        />
        
        {/* Structured Data - Product */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Moonlit AI Plugin Generator",
              "description": "AI-powered tool that generates professional Minecraft plugins from natural language descriptions in seconds.",
              "brand": {
                "@type": "Brand",
                "name": "Moonlit AI"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "description": "Free tier available"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "1247",
                "bestRating": "5",
                "worstRating": "1"
              }
            })
          }}
        />
        
        {/* Structured Data - FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is Moonlit AI and how does it work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Moonlit AI is an advanced machine learning platform specifically trained on Minecraft plugin development. It uses natural language processing to understand your plugin requirements and generates production-ready Java code compatible with Spigot, Paper, and Bukkit servers."
                  }
                },
                {
                  "@type": "Question", 
                  "name": "Do I need programming knowledge to create plugins with Pegasus?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely not! Moonlit AI is designed for everyone - from server owners with zero coding experience to experienced developers looking to accelerate their workflow. Simply describe your plugin functionality in natural language."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Which Minecraft versions and server software are supported?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Moonlit AI generates plugins compatible with Minecraft versions 1.16 through 1.20+, supporting Spigot, Paper, Purpur, and other Bukkit-based server software."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What does the free tier include?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our free tier includes 100,000 AI tokens, enough to generate 15-25 medium-complexity plugins. This lets you fully evaluate Moonlit AI's capabilities before upgrading."
                  }
                }
              ]
            })
          }}
        />
        
        {/* Structured Data - BreadcrumbList */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://pegasus.ai/"
                },
                {
                  "@type": "ListItem", 
                  "position": 2,
                  "name": "Features",
                  "item": "https://pegasus.ai/#features"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "FAQ",
                  "item": "https://pegasus.ai/#faq"
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "name": "Comparison",
                  "item": "https://pegasus.ai/#comparison"
                }
              ]
            })
          }}
        />
        
        <script src="https://cdn.tailwindcss.com"></script>
        <style jsx global>{`
          body {
            font-family: 'Inter', sans-serif;
            background-color: #0A0F1F;
          }
          .gradient-text {
            background-image: linear-gradient(to right, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(1deg); }
            66% { transform: translateY(-10px) rotate(-1deg); }
          }
        `}</style>
      </Head>
      
      {/* Debug Panel - Only show in development */}
      {isDevelopmentMode && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-sm p-2 text-center">
          <div className="container mx-auto flex justify-between items-center">
            <span>
              AUTH DEBUG: {session ? `Logged in as ${session.user?.email || session.user?.id}` : 'Not authenticated'}
            </span>
          </div>
        </div>
      )}
      
      <div className="relative overflow-x-hidden bg-[#0A0F1F] text-slate-300 antialiased" style={{ marginTop: isDevelopmentMode && session ? '40px' : '0' }}>
        <Header onSignInClick={handleSignIn} session={session} onDashboardClick={handleDashboard} />
        <main role="main">
          <article>
            <Hero onGetStartedClick={handleSignIn} session={session} onDashboardClick={handleDashboard} />
            <section aria-label="Product showcase">
              <Showcase />
            </section>
            <section aria-label="Frequently asked questions">
              <FAQ />
            </section>
            <section aria-label="Product comparison">
              <div id="comparison" className="py-20 sm:py-32 bg-[#0A0F1F]">
                <div className="container mx-auto px-6">
                  <div className="max-w-3xl mx-auto text-center mb-16">
                    <motion.h2 
                      className="text-4xl md:text-5xl font-extrabold text-white"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      How We Compare
                    </motion.h2>
                    <motion.p 
                      className="mt-4 text-lg text-slate-300"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      See how Moonlit AI stands against the competition in features, quality, and value.
                    </motion.p>
                  </div>
                  <div className="flex justify-center">
                    <ComparisonTable />
                  </div>
                </div>
              </div>
            </section>
            <section aria-label="Call to action">
              <Waitlist onSignInClick={handleSignIn} />
            </section>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
