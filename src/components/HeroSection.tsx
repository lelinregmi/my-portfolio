import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import profileImg from "@/assets/lelin-profile.jpg";
import { ArrowDown } from "lucide-react";

const roles = ["Computer Engineer", "Web Developer", "AI/ML Learner"];

const useTypingAnimation = (texts: string[], typingSpeed = 80, deletingSpeed = 50, pauseTime = 1500) => {
  const [displayText, setDisplayText] = useState("");
  const indexRef = useRef(0);
  const charRef = useRef(0);
  const deletingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const tick = useCallback(() => {
    const current = texts[indexRef.current];

    if (!deletingRef.current) {
      charRef.current++;
      setDisplayText(current.slice(0, charRef.current));

      if (charRef.current === current.length) {
        timeoutRef.current = setTimeout(() => {
          deletingRef.current = true;
          tick();
        }, pauseTime);
        return;
      }
      timeoutRef.current = setTimeout(tick, typingSpeed);
    } else {
      charRef.current--;
      setDisplayText(current.slice(0, charRef.current));

      if (charRef.current === 0) {
        deletingRef.current = false;
        indexRef.current = (indexRef.current + 1) % texts.length;
        timeoutRef.current = setTimeout(tick, typingSpeed);
        return;
      }
      timeoutRef.current = setTimeout(tick, deletingSpeed);
    }
  }, [texts, typingSpeed, deletingSpeed, pauseTime]);

  useEffect(() => {
    timeoutRef.current = setTimeout(tick, typingSpeed);
    return () => clearTimeout(timeoutRef.current);
  }, [tick, typingSpeed]);

  return displayText;
};

const HeroSection = () => {
  const typedText = useTypingAnimation(roles);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 flex flex-col-reverse md:flex-row items-center gap-10 md:gap-16">
        {/* Text */}
        <div className="text-center md:text-left flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-mono text-sm sm:text-base tracking-wider text-muted-foreground mb-4 h-6"
          >
            I am a{" "}
            <span className="text-primary text-glow">{typedText}</span>
            <span className="animate-pulse text-primary">|</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-none mb-5"
          >
            <span className="gradient-text">Lelin Kumar</span>
            <br />
            <span className="text-foreground">Regmi</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-base md:text-lg text-muted-foreground max-w-lg mb-8"
          >
            BE in Computer Engineering — crafting modern web experiences and software solutions that make an impact.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex gap-4 justify-center md:justify-start"
          >
            <a
              href="#about"
              className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:box-glow transition-shadow duration-300"
            >
              Explore
            </a>
            <a
              href="#contact"
              className="px-8 py-3 rounded-lg border border-border text-foreground hover:border-primary hover:text-primary transition-colors duration-300"
            >
              Contact
            </a>
          </motion.div>
        </div>

        {/* Profile image - right side, rectangle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="flex-shrink-0"
        >
          <div className="relative w-56 h-72 sm:w-64 sm:h-80 md:w-72 md:h-96 rounded-xl overflow-hidden border-2 border-primary/40 box-glow">
            <img src={profileImg} alt="Lelin Kumar Regmi" className="w-full h-full object-cover object-top" />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ArrowDown className="w-5 h-5" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
