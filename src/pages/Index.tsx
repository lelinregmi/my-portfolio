import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import BlogSection from "@/components/BlogSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <BlogSection />
      <ContactSection />
      <footer className="py-8 border-t border-border text-center">
        <p className="text-sm text-muted-foreground font-mono">
          © 2026 Lelin Kumar Regmi. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
