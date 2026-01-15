'use client';

import { Section } from '@/components/ui/Layout';
import { motion } from 'framer-motion';

export function About() {
  return (
    <Section id="about" className="bg-white/5 border-y border-white/10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-8 text-white"
        >
          Redefining the Todo List
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-text-muted leading-relaxed mb-6"
        >
          We believe productivity isn't just about doing more—it's about doing what matters.
          Our vision is to create a seamless interface between human intention and machine intelligence,
          letting you focus on your creative work while our AI handles the organization.
          Augmented Productivity is the future.
        </motion.p>
        <motion.p
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.4 }}
           className="text-base md:text-lg text-text-muted leading-relaxed max-w-3xl mx-auto"
        >
          This Todo App project represents a modern approach to task management, combining a robust 
          Next.js frontend with a powerful FastAPI backend. Designed for developers and power users, 
          it features real-time updates, intelligent categorization, and a sleek, responsive UI 
          crafted for efficiency and focus.
        </motion.p>
      </div>
    </Section>
  );
}
