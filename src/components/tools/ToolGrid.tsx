'use client'

import { tools } from '@/config/tools'
import { ToolCard } from './ToolCard'
import { motion } from 'framer-motion'

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
}

const fadeInUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
}

export function ToolGrid() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {tools.map(tool => (
        <motion.div key={tool.slug} variants={fadeInUp}>
          <ToolCard tool={tool} />
        </motion.div>
      ))}
    </motion.div>
  )
}
