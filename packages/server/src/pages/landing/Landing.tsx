import Hero from "./components/Hero";
import Problem from "./components/Problem";
import Solution from "./components/Solution";
import TwoTierModel from "./components/Pricing";
import Footer from "./components/Footer";
import Navbar from "./components/LandingNav";

const Index = () => {
  return (
      <div className="min-h-screen">
        <Navbar />
        <Hero />
        <Problem />
        <Solution />
        <TwoTierModel />
        <Footer />
      </div>
  );
};

export default Index;