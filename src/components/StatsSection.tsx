import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Zap } from "lucide-react";

function Counter({ value, delay }: { value: string; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const numericValue = parseInt(value.replace(/\D/g, ""));
  const suffix = value.replace(/[0-9]/g, "");

  const springValue = useSpring(0, {
    damping: 30,
    stiffness: 50,
    duration: 2
  });

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        springValue.set(numericValue);
      }, delay * 1000);
    }
  }, [isInView, numericValue, delay, springValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}{suffix}
    </span>
  );
}

export function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax effects - diferentes velocidades
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const y3 = useTransform(scrollYProgress, [0, 1], [150, -150]);

  // Color shift effect
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["rgb(0 0 0)", "rgb(10 0 20)", "rgb(0 0 0)"]
  );

  // Rotation effect
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  const stats = [
    { value: "500M+", label: "Alcance Total", delay: 0 },
    { value: "1000+", label: "Campanhas Realizadas", delay: 0.1 },
    { value: "98%", label: "Taxa de Sucesso", delay: 0.2 },
    { value: "50+", label: "Marcas Parceiras", delay: 0.3 },
  ];

  return (
    <motion.section
      ref={sectionRef}
      style={{ backgroundColor }}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Top gradient overlay for smooth transition from Hero */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />

      {/* Parallax Background Elements */}
      <motion.div
        style={{ y: y3 }}
        className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: y1 }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
      />

      {/* Rotating Lightning Icon */}
      <motion.div
        style={{ rotate, y: y2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5"
      >
        <Zap className="w-96 h-96 text-accent" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-accent via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Números que Impressionam
            </span>
          </h2>
          <p className="text-white/60 text-lg">Resultados reais, impacto mensurável</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, rotateX: -90 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 1.5,
                delay: stat.delay,
                type: "spring",
                stiffness: 50,
                damping: 20
              }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                z: 20,
              }}
              className="relative group"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative glass-premium p-6 sm:p-8 rounded-3xl border border-white/10 transform-gpu h-full flex flex-col justify-center items-center text-center backdrop-blur-xl bg-black/40">
                <motion.div
                  className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-br from-accent to-purple-400 bg-clip-text text-transparent"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1.2,
                    delay: stat.delay + 0.2,
                    type: "spring",
                  }}
                >
                  <Counter value={stat.value} delay={stat.delay + 0.5} />
                </motion.div>
                <div className="text-xs sm:text-sm text-white/50 uppercase tracking-wider font-medium">
                  {stat.label}
                </div>

                {/* Animated border */}
                <motion.div
                  className="absolute inset-0 rounded-3xl opacity-30"
                  style={{
                    background: "linear-gradient(45deg, transparent, rgba(255,107,53,0.3), transparent)",
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </motion.section>
  );
}
