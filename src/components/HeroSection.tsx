import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-gray-900 text-white">
      {/* Hero background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')",
          backgroundPosition: "center",
          opacity: 0.4,
        }}
      ></div>

      {/* Content */}
      <div className="container mx-auto px-4 py-24 md:py-36 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Gambo Stadium
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100">
            Professional football grounds for matches, training, and events.
            Book online and play like a pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate("/booking")}
              className="bg-gambo hover:bg-gambo-dark text-white px-6 py-3 text-lg"
            >
              Book Ground
            </Button>
            <Button
              onClick={() => navigate("/about")}
              variant="outline"
              className="border-white bg-transparent text-white hover:bg-white/10 px-6 py-3 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
