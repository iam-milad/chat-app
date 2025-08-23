import { Mic } from "lucide-react";
import { motion } from "framer-motion";

const AnimatedMic = () => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.15, 1],
        color: ["#ffffff", "#9ca3af", "#374151", "#9ca3af", "#ffffff"], // fade white→gray→dark→gray→white
      }}
      transition={{
        scale: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
        color: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      style={{ display: "inline-flex" }}
    >
      <Mic size={22} />
    </motion.div>
  );
};

export default AnimatedMic;
