import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HolographicButton } from './ui/HolographicButton';
import { GlassCard } from './ui/GlassCard';
import { AnimatedCounter } from './ui/AnimatedCounter';
import { ParticleField, HolographicInterface, PureCSSBackground } from './ui/PureCSSBackground';
import { GoogleLogin } from '@react-oauth/google';

// Extend window type for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface LandingPageProps {
  onGoogleLogin: () => void;
  authError?: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  google_id: string;
}

// Hero Section Component
function HeroSection({ 
  onGoogleLogin, 
  authError, 
  handleOAuthSuccess, 
  handleOAuthError,
  handleStartFreeTrial
}: { 
  onGoogleLogin: () => void; 
  authError?: string | null;
  handleOAuthSuccess: (userData: User) => void;
  handleOAuthError: (error: string) => void;
  handleStartFreeTrial: () => void;
}) {
  const [typedText, setTypedText] = useState('');
  const fullText = 'The Future of Hiring is Here';
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Pure CSS Background - No Three.js */}
      <div className="absolute inset-0 z-0">
        <PureCSSBackground />
      </div>
      
      {/* Particle Field */}
      <ParticleField particleCount={150} className="z-10" />
      
      {/* Holographic Interface */}
      <HolographicInterface className="z-20" />
      
      {/* Hero Content */}
      <div className="relative z-40 text-center px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Main Headline */}
          <h1 className="text-hero font-display font-bold mb-6">
            <span className="text-hologram">
              {typedText}
              <motion.span
                className="border-r-4 border-primary-400 ml-1"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </span>
          </h1>
          
          {/* Subheadline */}
          <motion.p
            className="text-2xl md:text-3xl text-white/90 mb-8 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            AI-Powered. Bias-Free. Performance Guaranteed.
          </motion.p>
          
          {/* EXACT approved buttons */}
          <motion.div
            className="flex gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.6 }}
          >
            <button 
              onClick={handleStartFreeTrial}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:scale-105 transition-transform font-semibold"
            >
              Start Free Trial
            </button>
            
            {/* Debug info - remove after testing */}
            <div className="mt-4 text-xs text-gray-400 bg-black/20 p-2 rounded">
              <div>Google Script: {window.google ? '✅ Loaded' : '❌ Not loaded'}</div>
              <div>Google Accounts: {window.google?.accounts ? '✅ Available' : '❌ Not available'}</div>
              <div>Google ID: {window.google?.accounts?.id ? '✅ Ready' : '❌ Not ready'}</div>
            </div>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:scale-105 transition-transform">
              Watch Demo
            </button>
            
            {/* Auth Error Display */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-500/20 border border-red-400 rounded-lg"
              >
                <p className="text-red-400 text-sm">
                  ⚠️ {authError}
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
        
      </div>
    </section>
  );
}

// Features Showcase Section
function FeaturesSection() {
  const features = [
    {
      icon: '🧠',
      title: 'AI-Powered Analysis',
      description: 'Advanced neural networks analyze resumes, predict success, and eliminate human bias.',
      color: 'primary'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Process thousands of applications in seconds with our optimized AI pipeline.',
      color: 'electric'
    },
    {
      icon: '🎯',
      title: 'Precision Matching',
      description: 'Find the perfect candidates with 94% success rate guarantee.',
      color: 'emerald'
    },
    {
      icon: '🔒',
      title: 'Bias-Free Hiring',
      description: 'Eliminate unconscious bias with our certified fair hiring algorithms.',
      color: 'amber'
    },
    {
      icon: '📊',
      title: 'Predictive Intelligence',
      description: 'Forecast candidate performance and team chemistry before hiring.',
      color: 'primary'
    },
    {
      icon: '🌐',
      title: 'Global Talent Pool',
      description: 'Access verified candidates from our worldwide network.',
      color: 'electric'
    }
  ];

  return (
    <section className="relative py-32 px-4 z-30 bg-dark-900/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-display font-display font-bold text-hologram mb-6">
            Revolutionary Features
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Experience the next generation of hiring technology with AI-powered tools
            that transform how you discover, evaluate, and hire top talent.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard hover={true} glow={true} className="h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-float">
                    {feature.icon}
                  </div>
                  <h3 className={`text-xl font-semibold mb-3 text-${feature.color}-400`}>
                    {feature.title}
                  </h3>
                  <p className="text-white/70">
                    {feature.description}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Success Stories Section
function SuccessStoriesSection() {
  const testimonials = [
    {
      company: 'TechCorp',
      logo: '🚀',
      quote: 'Reduced hiring time by 75% while improving candidate quality significantly.',
      author: 'Sarah Chen, Head of Talent',
      stats: { hires: 150, timeReduction: 75, satisfaction: 98 }
    },
    {
      company: 'InnovateLabs',
      logo: '⚗️',
      quote: 'The bias-free hiring feature transformed our diversity metrics completely.',
      author: 'Marcus Johnson, CEO',
      stats: { hires: 89, timeReduction: 60, satisfaction: 96 }
    },
    {
      company: 'GlobalTech',
      logo: '🌍',
      quote: 'AI predictions helped us build our strongest engineering team ever.',
      author: 'Elena Rodriguez, CTO',
      stats: { hires: 234, timeReduction: 80, satisfaction: 99 }
    }
  ];

  return (
    <section className="relative py-32 px-4 z-30 bg-dark-900/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-display font-display font-bold text-hologram mb-6">
            Success Stories
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Join thousands of companies that have transformed their hiring process
            with our AI-powered platform.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <GlassCard hover={true} className="h-full">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">{testimonial.logo}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {testimonial.company}
                  </h3>
                </div>
                
                <blockquote className="text-white/80 italic mb-6 text-center">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="text-center text-primary-400 font-medium mb-6">
                  — {testimonial.author}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <AnimatedCounter 
                      value={testimonial.stats.hires} 
                      className="text-emerald-400 text-lg font-bold" 
                    />
                    <p className="text-white/60 text-xs">Hires</p>
                  </div>
                  <div>
                    <AnimatedCounter 
                      value={testimonial.stats.timeReduction} 
                      suffix="%" 
                      className="text-electric-400 text-lg font-bold" 
                    />
                    <p className="text-white/60 text-xs">Time Saved</p>
                  </div>
                  <div>
                    <AnimatedCounter 
                      value={testimonial.stats.satisfaction} 
                      suffix="%" 
                      className="text-amber-400 text-lg font-bold" 
                    />
                    <p className="text-white/60 text-xs">Satisfaction</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


// Main Landing Page Component
export function LandingPage({ onGoogleLogin, authError }: LandingPageProps) {
  
  const handleOAuthError = (error: string) => {
    console.error('OAuth Error:', error);
  };

  const handleStartFreeTrial = () => {
    console.log('Start Free Trial clicked');
    console.log('Window.google:', window.google);
    console.log('Window.google.accounts:', window.google?.accounts);
    console.log('Window.google.accounts.id:', window.google?.accounts?.id);
    
    // Trigger Google OAuth popup invisibly
    if (window.google?.accounts?.id) {
      console.log('Triggering Google OAuth popup...');
      window.google.accounts.id.prompt();
    } else {
      console.error('Google OAuth not initialized - trying to reinitialize...');
      
      // Try to reinitialize Google OAuth
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: "1059515914490-mror8dqhgdgi2qaoeidrqulfr8ml7f0j.apps.googleusercontent.com",
          callback: handleGoogleCallback
        });
        setTimeout(() => {
          if (window.google?.accounts?.id) {
            window.google.accounts.id.prompt();
          } else {
            handleOAuthError('Google OAuth still not available after reinitialize');
          }
        }, 500);
      } else {
        handleOAuthError('Google OAuth script not loaded');
      }
    }
  };

  const handleGoogleCallback = async (response: any) => {
    try {
      console.log('Google callback received:', response);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const result = await fetch(`${apiUrl}/api/v1/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential
        }),
      });

      if (!result.ok) {
        throw new Error(`Authentication failed (${result.status})`);
      }

      const data = await result.json();
      
      if (data.success && data.user) {
        // Store authentication data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('sessionExpiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        throw new Error('Invalid response from authentication server');
      }
    } catch (error) {
      console.error('Google OAuth failed:', error);
      handleOAuthError(error instanceof Error ? error.message : 'Authentication failed');
    }
  };
  
  const handleOAuthSuccess = (userData: User) => {
    // Store user data and redirect to dashboard
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('OAuth Success, redirecting to dashboard...', userData);
    
    // Force immediate redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 100);
  };
  
  // Initialize Google OAuth invisibly
  useEffect(() => {
    console.log('Initializing Google OAuth script...');
    
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      console.log('Google script already exists, removing it first');
      document.body.removeChild(existingScript);
    }
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google OAuth script loaded successfully');
      console.log('Window.google available:', !!window.google);
      console.log('Window.google.accounts available:', !!window.google?.accounts);
      console.log('Window.google.accounts.id available:', !!window.google?.accounts?.id);
      
      if (window.google?.accounts?.id) {
        try {
          console.log('Initializing Google OAuth with client ID...');
          window.google.accounts.id.initialize({
            client_id: "1059515914490-mror8dqhgdgi2qaoeidrqulfr8ml7f0j.apps.googleusercontent.com",
            callback: handleGoogleCallback,
            auto_select: false,
            cancel_on_tap_outside: true
          });
          console.log('Google OAuth initialized successfully');
        } catch (error) {
          console.error('Error initializing Google OAuth:', error);
        }
      } else {
        console.error('Google Identity Services not available after script load');
      }
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google OAuth script:', error);
    };
    
    document.body.appendChild(script);
    console.log('Google OAuth script added to DOM');
    
    return () => {
      // Cleanup script on unmount
      const scriptToRemove = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (scriptToRemove) {
        document.body.removeChild(scriptToRemove);
        console.log('Google OAuth script removed from DOM');
      }
    };
  }, []);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div className="relative min-h-screen bg-dark-900 overflow-hidden">
      {/* Background with parallax */}
      <motion.div 
        className="fixed inset-0 z-0"
        style={{ y }}
      >
        <div className="absolute inset-0 bg-mesh-gradient opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/50 via-transparent to-dark-900"></div>
      </motion.div>
      
      {/* Content */}
      <div className="relative z-10">
        <HeroSection 
          onGoogleLogin={onGoogleLogin} 
          authError={authError}
          handleOAuthSuccess={handleOAuthSuccess}
          handleOAuthError={handleOAuthError}
          handleStartFreeTrial={handleStartFreeTrial}
        />
        <FeaturesSection />
        <SuccessStoriesSection />
      </div>
    </div>
  );
}