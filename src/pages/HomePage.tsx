import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, CreditCard, Users, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Our Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Ground Booking"
              description="Book our professional football grounds online for your matches and training sessions."
              icon={<Calendar className="h-10 w-10 text-gambo" />}
            />
            <FeatureCard
              title="Premium Training"
              description="Join our premium training programs led by professional coaches."
              icon={<Award className="h-10 w-10 text-gambo" />}
            />
            <FeatureCard
              title="Team Management"
              description="Register your team and manage your players efficiently."
              icon={<Users className="h-10 w-10 text-gambo" />}
            />
          </div>

          <div className="mt-12 flex justify-center">
            <Button
              onClick={() => navigate("/booking")}
              className="bg-gambo hover:bg-gambo-dark"
            >
              Book Now <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Our Customers Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gambo rounded-full flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">John Doe</h4>
                  <p className="text-gray-500">Local Club Captain</p>
                </div>
              </div>
              <p className="text-gray-700">
                "The grounds at Gambo Stadium are always perfectly maintained.
                Booking process is smooth and the staff is friendly."
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gambo rounded-full flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Sarah Mitchell</h4>
                  <p className="text-gray-500">Youth Team Coach</p>
                </div>
              </div>
              <p className="text-gray-700">
                "The premium training program has been a game-changer for our
                youth team. Professional coaching at affordable rates."
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gambo rounded-full flex items-center justify-center text-white font-bold">
                  RJ
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Robert Johnson</h4>
                  <p className="text-gray-500">Regular Customer</p>
                </div>
              </div>
              <p className="text-gray-700">
                "I've been booking this ground for weekly matches with friends
                for over a year now. The online booking system makes it so
                easy!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gambo text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Book Your Next Match?
          </h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Join hundreds of satisfied customers who trust Gambo Stadium for
            their football needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/booking")}
              variant="secondary"
              className="bg-white text-gambo hover:bg-gray-100"
            >
              Book Ground
            </Button>
            <Button
              onClick={() => navigate("/premium")}
              variant="outline"
              className="border-white bg-transparent text-white hover:bg-gambo-dark"
            >
              Explore Premium Training
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
