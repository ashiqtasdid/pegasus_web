/* eslint-disable react/no-unescaped-entities, @next/next/no-page-custom-font, @next/next/no-sync-scripts */
'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Rocket } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import { signOut } from '@/lib/auth-client';

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
const Header: React.FC<{ onSignInClick: () => void }> = ({ onSignInClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F1F]/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-white">Pegasus</div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
          <a href="#faq" className="text-slate-300 hover:text-white transition-colors">FAQ</a>
          <a href="#reviews" className="text-slate-300 hover:text-white transition-colors">Reviews</a>
          <a href="#waitlist" className="text-slate-300 hover:text-white transition-colors">Waitlist</a>
        </nav>
        <button onClick={onSignInClick} className="hidden md:block bg-white text-slate-900 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
          Sign In
        </button>
      </div>
    </header>
  );
};

// Hero Component
const BackgroundShape: React.FC<{ className?: string }> = ({ className }) => {
    return <div className={`absolute bg-blue-500/10 w-64 h-64 rounded-lg filter blur-3xl ${className}`}></div>
}

const Hero: React.FC<{ onGetStartedClick: () => void }> = ({ onGetStartedClick }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden pt-20">
      <BackgroundShape className="top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2" />
      <BackgroundShape className="bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-6 z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
          Create Minecraft
          <br />
          plugins with the <span className="gradient-text">Power of AI.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300">
          Describe the plugin you want in plain English. Pegasus's advanced AI generates high-quality, ready-to-use Minecraft plugins in seconds.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onGetStartedClick}
            className="w-full sm:w-auto bg-white text-slate-900 font-semibold px-8 py-3 rounded-lg hover:bg-slate-200 transition-colors transform hover:scale-105"
          >
            Get Started
          </button>
          <a
            href="#features"
            className="w-full sm:w-auto bg-transparent border border-slate-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-slate-800 hover:border-slate-500 transition-colors transform hover:scale-105"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
};

// Advantage Component
const Advantage: React.FC = () => {
  const features = [
    { name: 'Natural Language Plugin Generation', pegasus: true, manual: false },
    { name: 'Instant Plugin Creation', pegasus: true, manual: false },
    { name: 'Works with Spigot, Paper, etc.', pegasus: true, manual: false },
    { name: 'No Setup or Dependencies', pegasus: true, manual: false },
    { name: 'Automatic Code Optimization', pegasus: true, manual: false },
    { name: 'One-Click Server Deployment', pegasus: true, manual: false },
  ];

  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">An Unfair Advantage</h2>
          <p className="mt-4 text-lg text-slate-300">
            Pegasus is built on a modern AI architecture that leaves the complexity of manual plugin development behind.
          </p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="grid grid-cols-3 text-left font-semibold text-white px-6 py-4 border-b border-slate-700">
              <div>Feature</div>
              <div className="text-center">Pegasus</div>
              <div className="text-center">Manual Coding</div>
            </div>
            
            <div className="divide-y divide-slate-700">
              {features.map((feature, index) => (
                <div key={index} className="grid grid-cols-3 items-center px-6 py-5">
                  <div className="font-medium text-slate-200">{feature.name}</div>
                  <div className="flex justify-center">
                    {feature.pegasus ? <Icon type="check" /> : <Icon type="cross" />}
                  </div>
                  <div className="flex justify-center">
                    {feature.manual ? <Icon type="check" /> : <Icon type="cross" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Showcase Component
const Showcase: React.FC = () => {
  type ShowcaseTab = 'simple' | 'custom' | 'complex';

  const showcaseData = {
    simple: {
      label: 'Simple Prompt',
      filename: 'Simple Prompt.prompt',
      code: `# User Prompt:
> a plugin that gives players a diamond when they type /gift

# Pegasus AI is generating...

# Generated plugin.yml:
name: GiftDiamond
version: 1.0
main: com.pegasus.giftdiamond.GiftDiamond
author: PegasusAI
commands:
  gift:
    description: Gives the player a diamond.`
    },
    custom: {
      label: 'Custom Items',
      filename: 'Custom Items.prompt',
      code: `# User Prompt:
> Create a custom sword named "Zeus's Bolt" that strikes lightning on hit

# Pegasus AI is generating...

# Generated code snippet:
@EventHandler
public void onEntityDamageByEntity(EntityDamageByEntityEvent event) {
    if (event.getDamager() instanceof Player) {
        Player player = (Player) event.getDamager();
        ItemStack itemInHand = player.getInventory().getItemInMainHand();
        if (itemInHand.hasItemMeta() && itemInHand.getItemMeta().getDisplayName().equals("Zeus's Bolt")) {
            event.getEntity().getWorld().strikeLightning(event.getEntity().getLocation());
        }
    }
}`
    },
    complex: {
      label: 'Complex Logic',
      filename: 'Complex Logic.prompt',
      code: `# User Prompt:
> Create a capture the flag game mode with two teams, red and blue.

# Pegasus AI is generating...

# Generated game logic:
public class CaptureTheFlagGame {
    private Team redTeam;
    private Team blueTeam;
    private Flag redFlag;
    private Flag blueFlag;

    public void startGame() { ... }
    public void onPlayerJoin(Player player, Team team) { ... }
    public void onFlagCapture(Player player, Flag flag) { ... }
    public void checkForWinCondition() { ... }
}`
    },
  };

  const [activeTab, setActiveTab] = useState<ShowcaseTab>('simple');
  const activeShowcase = showcaseData[activeTab];

  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">Build in the Future</h2>
          <p className="mt-4 text-lg text-slate-300">
            Experience a tool that turns your ideas into reality, instantly.
          </p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="flex justify-center space-x-2 sm:space-x-4 mb-8">
            {(Object.keys(showcaseData) as ShowcaseTab[]).map((tabKey) => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-lg transition-colors ${
                  activeTab === tabKey
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {showcaseData[tabKey].label}
              </button>
            ))}
          </div>

          <div className="bg-[#1E293B] rounded-xl border border-slate-700 overflow-hidden shadow-2xl shadow-blue-500/10">
            <div className="bg-slate-900/70 px-4 py-2 text-xs text-slate-400 font-mono border-b border-slate-700">
              {activeShowcase.filename}
            </div>
            <pre className="p-6 text-sm text-left overflow-x-auto">
              <code className="font-mono text-slate-300 whitespace-pre-wrap">{activeShowcase.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

// FAQ Component
const FAQ: React.FC = () => {
  const faqData = [
    {
      question: 'What is Pegasus?',
      answer: "Pegasus is an AI-powered platform that allows you to create high-quality, ready-to-use Minecraft plugins simply by describing what you want in plain English. It's designed to speed up development and make custom server features accessible to everyone."
    },
    {
      question: 'How does the AI generate plugins?',
      answer: "Pegasus uses a state-of-the-art AI model, fine-tuned specifically for Minecraft plugin development. When you provide a prompt, the AI understands your requirements, writes the necessary Java code, configures the plugin.yml file, and optimizes it for performance and compatibility."
    },
    {
      question: 'What versions and server software are supported?',
      answer: "Pegasus generates plugins that are compatible with the most popular Minecraft server software, including Spigot and its forks like Paper and Purpur. We aim to support the latest versions of Minecraft, and our AI is continuously updated."
    },
    {
      question: 'Do I need to know how to code to use Pegasus?',
      answer: "Absolutely not! Pegasus is designed for everyone, from server owners with no coding experience to seasoned developers looking to prototype ideas quickly. You just need to describe the plugin you want."
    },
    {
      question: 'Can I customize the generated code?',
      answer: "Yes. While Pegasus generates ready-to-use plugins, it also provides you with the full source code. If you're a developer, you can download the code and modify it to fit your specific needs."
    },
    {
      question: 'Is there a free tier?',
      answer: "Yes, we offer a free tier that includes 100,000 tokens to get you started. This is enough to generate several plugins and experience the power of Pegasus firsthand. For more extensive use, we offer a simple low-cost subscription."
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const FaqItem: React.FC<{
    item: { question: string; answer: string };
    isOpen: boolean;
    onClick: () => void;
  }> = ({ item, isOpen, onClick }) => {
    return (
      <div className="border-b border-slate-700 py-6">
        <button
          onClick={onClick}
          className="w-full flex justify-between items-center text-left"
          aria-expanded={isOpen}
        >
          <span className="text-lg font-medium text-white">{item.question}</span>
          <span className="text-slate-400">
              <svg
                  className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
              >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m-6-6h12"></path>
              </svg>
          </span>
        </button>
        <div
          className={`grid transition-all duration-500 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
              <p className="pt-4 text-slate-300">
                  {item.answer}
              </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="faq" className="py-20 sm:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-slate-300">
            Have questions? We have answers. If you can't find what you're looking for, feel free to reach out.
          </p>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          {faqData.map((item, index) => (
            <FaqItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Reviews Component
const Reviews: React.FC = () => {
  const reviews = [
    {
      name: 'Alex "Hypixel"',
      title: 'Owner, Hypixel Network',
      avatar: 'https://i.pravatar.cc/40?u=alex',
      text: "Pegasus has revolutionized how we prototype new game modes. The speed from idea to playable plugin is mind-blowing. A must-have for any serious server."
    },
    {
      name: 'CaptainSparklez',
      title: 'Content Creator',
      avatar: 'https://i.pravatar.cc/40?u=jordan',
      text: "I can now create custom plugins for my series without writing a single line of code. Pegasus lets me focus on creating content, not debugging Java. It's an absolute game-changer."
    },
    {
      name: 'PebbleHost',
      title: 'CEO, PebbleHost',
      avatar: 'https://i.pravatar.cc/40?u=pebble',
      text: "We recommend Pegasus to all our customers. The plugins it generates are stable, performant, and secure. It's lowering the barrier to entry for creating unique Minecraft servers."
    },
  ];

  const StarRating: React.FC = () => (
      <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => <Icon key={i} type="star" />)}
      </div>
  )

  return (
    <section id="reviews" className="py-20 sm:py-32 bg-[#0A0F1F]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">Loved by Top Server Owners</h2>
          <p className="mt-4 text-lg text-slate-300">
            Don't just take our word for it. Here's what creators are saying about Pegasus.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 flex flex-col">
              <StarRating />
              <p className="mt-6 text-slate-300 flex-grow">"{review.text}"</p>
              <div className="mt-6 flex items-center">
                <Image src={review.avatar} alt={review.name} width={40} height={40} className="rounded-full" />
                <div className="ml-4">
                  <div className="font-semibold text-white">{review.name}</div>
                  <div className="text-slate-400 text-sm">{review.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Waitlist Component
const Waitlist: React.FC<{ onSignInClick: () => void }> = ({ onSignInClick }) => {
  return (
    <section id="waitlist" className="py-20 sm:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">Get Early Access</h2>
          <p className="mt-4 text-lg text-slate-300">
            Ready to transform your Minecraft server? Sign in to access the power of AI-driven plugin generation.
          </p>

          <div className="mt-10">
            <button
              onClick={onSignInClick}
              className="bg-white text-slate-900 font-semibold px-8 py-3 rounded-lg hover:bg-slate-200 transition-colors transform hover:scale-105"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900/50 border-t border-slate-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold text-white">Pegasus</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 col-span-1 md:col-span-3 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-400 hover:text-white">Features</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white">Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-white">GitHub</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white">Twitter</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white">Discord</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 py-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-sm">
        <p className="text-slate-400">© 2024 Pegasus, Inc. All rights reserved.</p>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          <a href="#" className="text-slate-400 hover:text-white"><Icon type="github" className="w-5 h-5"/></a>
          <a href="#" className="text-slate-400 hover:text-white"><Icon type="twitter" className="w-5 h-5"/></a>
          <a href="#" className="text-slate-400 hover:text-white"><Icon type="discord" className="w-5 h-5"/></a>
        </div>
      </div>
    </footer>
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
      // Only redirect if user is actually authenticated
      if (session) {
        router.push('/dashboard');
      }
    }
  }, [session, isPending, router, mounted]);

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleDebugSignOut = async () => {
    try {
      await signOut();
      // Also call our test logout endpoint to be sure
      await fetch('/api/test-logout', { method: 'POST' });
      window.location.reload(); // Force reload to clear all state
    } catch (error) {
      console.error('Sign out error:', error);
    }
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
        <title>Pegasus AI - Create Minecraft Plugins with AI</title>
        <meta name="description" content="Create high-quality, ready-to-use Minecraft plugins in seconds by describing what you want in plain English. Powered by advanced AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
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
        `}</style>
      </Head>
      
      {/* Debug Panel - Only show in development */}
      {isDevelopmentMode && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-sm p-2 text-center">
          <div className="container mx-auto flex justify-between items-center">
            <span>
              AUTH DEBUG: {session ? `Logged in as ${session.user?.email || session.user?.id}` : 'Not authenticated'}
            </span>
            {session && (
              <button 
                onClick={handleDebugSignOut}
                className="bg-red-800 hover:bg-red-900 px-3 py-1 rounded text-xs"
              >
                Debug: Sign Out
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="relative overflow-x-hidden bg-[#0A0F1F] text-slate-300 antialiased" style={{ marginTop: isDevelopmentMode && session ? '40px' : '0' }}>
        <Header onSignInClick={handleSignIn} />
        <main>
          <Hero onGetStartedClick={handleSignIn} />
          <Advantage />
          <Showcase />
          <FAQ />
          <Reviews />
          <Waitlist onSignInClick={handleSignIn} />
        </main>
        <Footer />
      </div>
    </>
  );
}
