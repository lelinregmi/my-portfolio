import { motion } from "framer-motion";
import { Mail, MapPin, Linkedin, Github } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 md:py-32">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-3">Contact</p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Let's <span className="gradient-text">connect</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-12">
            Open to opportunities, collaborations, and interesting conversations.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-lg ">lelinregmi.official@gmail.com</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-lg  ">Nepal</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-6"
        >
          <a href="https://github.com/lelinregmi" className="p-3 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-200">
            <Github className="w-5 h-5" />
          </a>
          <a href="https://www.linkedin.com/in/lelinregmi" className="p-3 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-200">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="mailto:lelinregmi.official@gmail.com" className="p-3 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-200">
            <Mail className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
