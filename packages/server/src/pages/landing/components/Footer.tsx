import ComparisonSection from "./ComparisonSection";
import CTASection from "./CTASection";
import FooterLinks from "./FooterLinks";

const Footer = () => {
  return (
    <footer className="bg-neo-beige-2 border-t-4 border-black relative overflow-hidden">
      <ComparisonSection />
      <CTASection />
      <FooterLinks />
    </footer>
  );
};

export default Footer;