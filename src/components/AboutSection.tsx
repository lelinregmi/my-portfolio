import { motion } from "framer-motion";
import { Cpu, Code, Database, Globe } from "lucide-react";

const skills = [
  { icon: Code, label: "Web Development", desc: "Modern, responsive websites & web applications" },
  { icon: Globe, label: "Full-Stack Solutions", desc: "End-to-end software from frontend to backend" },
  { icon: Database, label: "Data & Databases", desc: "SQL, NoSQL, and data-driven architectures" },
  { icon: Cpu, label: "IoT & Embedded", desc: "Smart connected devices & sensor integrations" },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <p className="font-mono text-sm text-primary tracking-widest uppercase mb-3">About</p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Turning complex problems into <span className="gradient-text">simple designs</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            I'm a Computer Engineering graduate who loves building software that solves real problems. 
            My focus is on crafting clean, performant websites and full-stack applications — from 
            intuitive user interfaces to scalable backend systems. I also enjoy working on IoT projects, 
            bringing software and connected devices together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-300"
            >
              <skill.icon className="w-8 h-8 text-primary mb-4 group-hover:text-glow transition-all" />
              <h3 className="font-semibold text-foreground mb-2">{skill.label}</h3>
              <p className="text-sm text-muted-foreground">{skill.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
