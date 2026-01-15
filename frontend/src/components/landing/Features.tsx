'use client';

import { FeatureCard, FeaturesGrid } from '@/components/ui/FeatureCard';
import { Section } from '@/components/ui/Layout';
import { Brain, Zap, Target, MessageSquare } from 'lucide-react';

const features = [
  {
    title: "Smart Suggestions",
    description: "AI predicts your next task based on context.",
    icon: <Brain className="w-8 h-8" />,
  },
  {
    title: "Auto-Priority",
    description: "Machine learning identifies urgent deadlines.",
    icon: <Zap className="w-8 h-8" />,
  },
  {
    title: "Focus Mode",
    description: "Dynamic task filtering to minimize distractions.",
    icon: <Target className="w-8 h-8" />,
  },
  {
    title: "Natural Language Sync",
    description: "Just type naturally, AI handles the details.",
    icon: <MessageSquare className="w-8 h-8" />,
  },
];

export function Features() {
  return (
    <Section id="features" className="bg-background-secondary">
      <div className="mb-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-text">Powerful AI Features</h2>
        <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
      </div>
      <FeaturesGrid>
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            index={index}
            {...feature}
          />
        ))}
      </FeaturesGrid>
    </Section>
  );
}
