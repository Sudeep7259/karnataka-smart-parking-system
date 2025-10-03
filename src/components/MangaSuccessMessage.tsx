import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

interface MangaSuccessMessageProps {
  message: string;
  show: boolean;
  onHide?: () => void;
  duration?: number;
}

export function MangaSuccessMessage({
  message,
  show,
  onHide,
  duration = 3000,
}: MangaSuccessMessageProps) {
  useEffect(() => {
    if (show && onHide) {
      const timer = setTimeout(onHide, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onHide, duration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0, rotate: 10 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full"
            style={{
              border: "4px solid black",
              boxShadow: "8px 8px 0px rgba(0, 0, 0, 0.8), 4px 4px 0px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Manga-style background pattern */}
            <div
              className="absolute inset-0 opacity-5 rounded-2xl"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(0,0,0,0.1) 10px,
                  rgba(0,0,0,0.1) 20px
                )`,
              }}
            />

            {/* Sparkle effects */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-4 -right-4"
            >
              <Sparkles className="h-8 w-8 text-yellow-400 fill-yellow-400" />
            </motion.div>

            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -180, -360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: 0.5,
              }}
              className="absolute -bottom-4 -left-4"
            >
              <Sparkles className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            </motion.div>

            {/* Success icon with manga burst effect */}
            <motion.div
              className="relative flex justify-center mb-6"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              {/* Burst lines */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: [0, 1, 0] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    className="absolute w-1 h-12 bg-yellow-400"
                    style={{
                      transform: `rotate(${i * 45}deg)`,
                    }}
                  />
                ))}
              </div>

              <CheckCircle2 className="h-20 w-20 text-green-500 fill-green-500 relative z-10" />
            </motion.div>

            {/* Manga-style text with speech bubble effect */}
            <div className="relative">
              {/* "SUCCESS!!" text */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-center mb-4"
              >
                <div
                  className="inline-block px-6 py-2 rounded-lg bg-black text-white font-black text-3xl tracking-wider"
                  style={{
                    fontFamily: "Impact, Arial Black, sans-serif",
                    textShadow: "3px 3px 0px rgba(255, 255, 255, 0.3)",
                    transform: "rotate(-2deg)",
                  }}
                >
                  SUCCESS!!
                </div>
              </motion.div>

              {/* Message in speech bubble */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 text-center"
                style={{
                  border: "3px solid black",
                  boxShadow: "4px 4px 0px rgba(0, 0, 0, 0.6)",
                }}
              >
                {/* Speech bubble tail */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: "15px solid transparent",
                    borderRight: "15px solid transparent",
                    borderBottom: "15px solid black",
                  }}
                />
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: "12px solid transparent",
                    borderRight: "12px solid transparent",
                    borderBottom: "12px solid white",
                  }}
                />

                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {message}
                </p>

                {/* Manga-style motion lines */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: "-100%", opacity: 0 }}
                      animate={{ x: "100%", opacity: [0, 0.3, 0] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "linear",
                      }}
                      className="absolute h-0.5 w-full bg-gradient-to-r from-transparent via-black to-transparent"
                      style={{
                        top: `${25 + i * 20}%`,
                        transform: `skewY(-${5 + i}deg)`,
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Sound effect text */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="absolute -right-8 top-0"
              >
                <div
                  className="text-4xl font-black text-yellow-400"
                  style={{
                    fontFamily: "Impact, Arial Black, sans-serif",
                    WebkitTextStroke: "2px black",
                    textShadow: "3px 3px 0px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  ★
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0, rotate: 20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="absolute -left-8 bottom-0"
              >
                <div
                  className="text-4xl font-black text-yellow-400"
                  style={{
                    fontFamily: "Impact, Arial Black, sans-serif",
                    WebkitTextStroke: "2px black",
                    textShadow: "3px 3px 0px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  ✨
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}