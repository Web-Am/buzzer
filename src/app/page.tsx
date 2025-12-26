'use client';

import { motion } from 'framer-motion';
import { Zap, Users, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from './components/ui/Button';
import Header from '@/app/components/shared/Header';

const features = [
  {
    icon: Zap,
    title: 'Realtime',
    desc: 'Sincronizzazione istantanea via Firebase Realtime Database.'
  },
  {
    icon: Users,
    title: 'Multiplayer',
    desc: 'Master, partecipanti e spettatori in un\'unica stanza.'
  },
  {
    icon: Trophy,
    title: 'Strategia',
    desc: 'Budget punti limitato e buzzer a costo dinamico.'
  }
];

function FeatureCard({ feature, index }: { feature: (typeof features)[number]; index: number; }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:border-primary-300 hover:shadow-xl"
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 transition-colors group-hover:bg-primary-100">
        <Icon className="text-primary-600 transition-transform group-hover:scale-110" size={24} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{feature.desc}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header></Header>
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >


          <h2 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Fanta in Tempo Reale
            <br />
            <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent animate-gradient">
              Velocità e Strategia
            </span>
          </h2>

          <p className="mb-10 text-lg leading-relaxed text-gray-600 sm:text-xl max-w-2xl mx-auto">
            Crea stanze di gioco, sfida i tuoi amici e vinci premendo il buzzer
            al momento giusto. Gestisci i tuoi punti con strategia!
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="group px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Users size={24} className="mr-2 transition-transform group-hover:scale-110" />
                Crea Stanza
                <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/join">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Zap size={24} className="mr-2" />
                Partecipa
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section migliorata */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h3 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            Perché scegliere Fanta Buzzer?
          </h3>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Tutto quello che ti serve per organizzare quiz competitivi e coinvolgenti
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-primary-600" />
              <span className="text-sm font-medium text-gray-600">Fanta Buzzer © 2025</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                Termini
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                Contatti
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
