import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#blog", label: "Blog" },
  { href: "/notes", label: "Notes" },
  { href: "#contact", label: "Contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const location = useLocation();
  const onHomePage = location.pathname === "/";

  const sectionHref = (href: string) =>
    onHomePage ? href : `/${href}`;

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved ? saved === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 10);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  return (
 
<nav
  className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300
  ${
    scrolled
      ? "bg-[#dcdfe2]/60 dark:bg-background/90 border-b-2 border-blue-500"
      : "bg-[#dcdfe2]/70 dark:bg-background/70 border-b-2 border-transparent"
  }`}
>
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-foreground">
          L<span className="text-primary">.</span>K<span className="text-primary">.</span>R
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) =>
            l.href === "/notes" ? (
              <Link key={l.href} to={l.href} className="text-lg text-[#39bcc8] hover:text-primary transition-colors font-mono">
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={sectionHref(l.href)} className="text-lg text-[#39bcc8] hover:text-primary transition-colors font-mono">
                {l.label}
              </a>
            ),
          )}
          <button onClick={toggleTheme} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-all">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setOpen(!open)} className="text-foreground p-2">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border px-6 py-4 flex flex-col gap-4">
          {links.map((l) =>
            l.href === "/notes" ? (
              <Link key={l.href} to={l.href} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-primary font-mono">
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={sectionHref(l.href)} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-primary font-mono">
                {l.label}
              </a>
            ),
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
