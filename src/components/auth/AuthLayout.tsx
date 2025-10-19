import React from 'react';
import { motion } from 'motion/react';
import { Activity, Heart, Brain, TrendingUp, AlertTriangle, BarChart3, Stethoscope, Shield } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

interface RiskIndicator {
  icon: React.ElementType;
  label: string;
  value: string;
  risk: 'low' | 'moderate' | 'high';
  delay: number;
  duration: number;
  x: number;
  y: number;
}

const riskIndicators: RiskIndicator[] = [
  { icon: Heart, label: 'Cardiac Risk', value: '12%', risk: 'low', delay: 0, duration: 20, x: 10, y: 15 },
  { icon: Brain, label: 'Neurological', value: '34%', risk: 'moderate', delay: 2, duration: 25, x: 85, y: 20 },
  { icon: Activity, label: 'Metabolic Score', value: '78%', risk: 'high', delay: 4, duration: 22, x: 20, y: 70 },
  { icon: TrendingUp, label: 'Risk Trend', value: '↗ 5%', risk: 'moderate', delay: 6, duration: 18, x: 75, y: 75 },
  { icon: AlertTriangle, label: 'Alert Level', value: 'Medium', risk: 'moderate', delay: 1, duration: 24, x: 60, y: 25 },
  { icon: BarChart3, label: 'Analytics', value: '89%', risk: 'low', delay: 3, duration: 21, x: 15, y: 45 },
  { icon: Stethoscope, label: 'Vital Signs', value: 'Stable', risk: 'low', delay: 5, duration: 19, x: 80, y: 50 },
  { icon: Shield, label: 'Prevention', value: 'Active', risk: 'low', delay: 7, duration: 23, x: 40, y: 80 },
];

function FloatingRiskIndicator({ indicator }: { indicator: RiskIndicator }) {
  const Icon = indicator.icon;
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-emerald-500';
      case 'moderate': return 'text-amber-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'moderate': return 'bg-amber-500/10 border-amber-500/20';
      case 'high': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <motion.div
      className={`absolute flex items-center space-x-2 px-3 py-2 rounded-lg border backdrop-blur-sm ${getRiskBg(indicator.risk)}`}
      style={{
        left: `${indicator.x}%`,
        top: `${indicator.y}%`,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: [0, 0.7, 0.4, 0.7, 0],
        scale: [0.8, 1, 1, 1, 0.8],
        y: [-20, 0, -10, 0, -20],
      }}
      transition={{
        duration: indicator.duration,
        delay: indicator.delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Icon className={`h-4 w-4 ${getRiskColor(indicator.risk)}`} />
      <div className="text-xs">
        <div className="font-medium text-foreground/80">{indicator.label}</div>
        <div className={`${getRiskColor(indicator.risk)}`}>{indicator.value}</div>
      </div>
    </motion.div>
  );
}

function DataStream({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 1 }}
    >
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"
          style={{
            left: `${20 + i * 15}%`,
            height: '100vh',
          }}
          initial={{ y: '-100vh' }}
          animate={{ y: '100vh' }}
          transition={{
            duration: 8 + i * 2,
            delay: delay + i * 0.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </motion.div>
  );
}

function PulseGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(circle at 25% 25%, var(--primary) 1px, transparent 1px),
          radial-gradient(circle at 75% 75%, var(--accent) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'pulse 4s ease-in-out infinite'
      }} />
    </div>
  );
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <PulseGrid />
      <DataStream delay={0} />
      <DataStream delay={4} />
      
      {/* Floating Risk Indicators */}
      <div className="absolute inset-0 pointer-events-none">
        {riskIndicators.map((indicator, index) => (
          <FloatingRiskIndicator key={index} indicator={indicator} />
        ))}
      </div>

      {/* Subtle animated shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/5"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full bg-accent/5"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
    </div>
  );
}