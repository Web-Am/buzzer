'use client';

import { motion } from 'framer-motion';
import { Zap, Users, Trophy, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './components/ui/Button';
import Header from '@/app/components/shared/Header';

const features = [
  {
    icon: Zap,
    title: 'Adrenalina Pura',
    desc: 'Ogni secondo conta. Premi il buzzer al momento giusto e guarda la classifica cambiare in tempo reale.'
  },
  {
    icon: Users,
    title: 'Sfida i Tuoi Amici',
    desc: 'Crea una stanza, condividi il codice e organizza quiz epici. Chi conosce meglio il gruppo vince.'
  },
  {
    icon: Trophy,
    title: 'Mosse da Campione',
    desc: 'Budget limitato, rilanci strategici: non vince chi preme più forte, ma chi punta meglio.'
  }
];

function FeatureCard({ feature, index }: { feature: (typeof features)[number]; index: number; }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800 p-6 shadow-md dark:shadow-gray-900/50 transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl dark:hover:shadow-primary-900/20"
    >
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/40 transition-colors group-hover:bg-primary-100 dark:group-hover:bg-primary-800/50">
        <Icon className="text-primary-600 dark:text-primary-400 transition-transform group-hover:scale-110" size={24} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{feature.desc}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-gray-950 dark:to-secondary-950">
      <Header />
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 dark:text-gray-100">
            Fanta in Tempo Reale
            <br />
            <span className="bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
              Velocità e Strategia
            </span>
          </h2>

          <p className="mb-10 text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl max-w-2xl mx-auto">
            Crea stanze di gioco, sfida i tuoi amici e vinci premendo il buzzer
            al momento giusto. Gestisci i tuoi crediti con strategia!
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
                className="group px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Zap size={24} className="mr-2 transition-transform group-hover:scale-110" />
                Partecipa
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h3 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
            Perché scegliere Fanta Buzzer?
          </h3>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Tutto quello che ti serve per organizzare quiz competitivi e coinvolgenti
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.png" alt="Fanta Buzzer" width={24} height={24} className="rounded-md" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fanta Buzzer &copy; 2026</span>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy-policy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Termini
              </Link>
              <Link href="/contact" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Contatti
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
