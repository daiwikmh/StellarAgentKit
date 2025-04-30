"use client"

import { useEffect, useRef } from "react"
import { Music, Film, Ghost, ShoppingBag, Shirt } from "lucide-react"
import { motion, useInView, useAnimation } from "framer-motion"

export function AnimatedTextIcons() {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  const iconVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  return (
    <div className="w-full py-20 lg:py-32 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-lg md:text-xl text-gray-300">Here's a fun fact:</p>
          <p className="text-xl md:text-2xl text-white font-medium">Today, you are the product</p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="max-w-5xl mx-auto"
        >
          {/* First row */}
          <div className="flex flex-col md:flex-row items-center justify-center mb-8 md:mb-12">
            <motion.h2
              variants={textVariants}
              className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white"
            >
              All functions
            </motion.h2>
            <motion.div
              variants={iconVariants}
              className="mx-4 bg-purple-500 rounded-full p-4 flex items-center justify-center"
            >
              <Music size={32} className="text-black" />
            </motion.div>
            <motion.h2
              variants={textVariants}
              className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white"
            >
              Stellar
            </motion.h2>
          </div>

          {/* Second row */}
          <div className="flex flex-col md:flex-row items-center justify-center mb-8 md:mb-12">
            <motion.h2
              variants={textVariants}
              className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white"
            >
              on
            </motion.h2>
            <motion.div
              variants={iconVariants}
              className="mx-4 bg-green-500 rounded-xl p-4 flex items-center justify-center"
            >
              <Film size={32} className="text-black" />
            </motion.div>
            <motion.h2
              variants={textVariants}
              className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white"
            >
              a
            </motion.h2>
          </div>

          {/* Third row */}
          <div className="flex flex-col md:flex-row items-center justify-center mb-8 md:mb-12">
            <motion.h2
              variants={textVariants}
              className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white"
            >
              single
            </motion.h2>
            <motion.div
              variants={iconVariants}
              className="mx-4 bg-orange-500 rounded-xl p-4 flex items-center justify-center"
            >
              <Ghost size={32} className="text-black" />
            </motion.div>
            <motion.h2
              variants={textVariants}
              className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white"
            >
              Dapp
            </motion.h2>
          </div>

          {/* Fourth row */}
          <div className="flex flex-col md:flex-row items-center justify-center flex-wrap">
            <motion.h2
              variants={textVariants}
              className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white"
            >
              provide liquidity to
            </motion.h2>
            <motion.div
              variants={iconVariants}
              className="mx-4 bg-yellow-500 rounded-xl p-4 flex items-center justify-center"
            >
              <ShoppingBag size={32} className="text-black" />
            </motion.div>
            <motion.div
              variants={iconVariants}
              className="mx-4 bg-blue-500 rounded-full p-4 flex items-center justify-center"
            >
              <Shirt size={32} className="text-black" />
            </motion.div>
            <motion.h2
              variants={textVariants}
              className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white"
            >
              pools.
            </motion.h2>
          </div>
        </motion.div>
      </div>
    </div>
  )
}