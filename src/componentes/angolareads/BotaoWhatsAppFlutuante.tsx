'use client'

import { motion } from 'framer-motion'

// Número de WhatsApp do suporte (mesmo usado no resto do site)
const NUMERO_WHATSAPP_SUPORTE = '244947399578'

export default function BotaoWhatsAppFlutuante() {
  return (
    <motion.a
      href={`https://wa.me/${NUMERO_WHATSAPP_SUPORTE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar connosco no WhatsApp"
      title="Falar connosco no WhatsApp"
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-emerald-900/20 ring-4 ring-white/60 transition-shadow hover:shadow-xl sm:bottom-6 sm:right-6"
    >
      <img src="/logos/whatsapp.svg" alt="" className="h-7 w-7" aria-hidden="true" />
      <span className="sr-only">Suporte via WhatsApp</span>
    </motion.a>
  )
}
