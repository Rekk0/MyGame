import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  line: string
  visible: boolean
}

const SpeechBubble: React.FC<Props> = ({ line, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.3 }}
        style={{
          maxWidth: 220,
          padding: '8px 12px',
          borderRadius: 12,
          background: 'rgba(15,15,25,0.88)',
          color: '#e0e0e0',
          fontSize: 13,
          lineHeight: 1.5,
          marginBottom: 8,
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {line}
      </motion.div>
    )}
  </AnimatePresence>
)

export default SpeechBubble
