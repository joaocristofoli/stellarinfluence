import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6"
    >
      <div className="max-w-7xl mx-auto glass rounded-full px-8 py-4 flex items-center justify-between">
        <Link to="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold tracking-tight"
          >
            <span className="text-gradient">AGENCY</span>
          </motion.div>
        </Link>
        
        <div className="flex items-center gap-8">
          <Link to="/">
            <motion.span
              whileHover={{ color: "hsl(var(--accent))" }}
              className="text-sm font-medium smooth-transition"
            >
              Home
            </motion.span>
          </Link>
          <Link to="/#creators">
            <motion.span
              whileHover={{ color: "hsl(var(--accent))" }}
              className="text-sm font-medium smooth-transition"
            >
              Criadores
            </motion.span>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-accent text-accent-foreground rounded-full font-medium text-sm smooth-transition hover:shadow-[0_0_30px_rgba(255,107,53,0.5)]"
          >
            Contato
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
