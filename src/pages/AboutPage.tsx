
import { CalendarCheck, Clock, MapPin, Phone, Mail, User, Award } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* About Hero Section */}
      <div className="relative bg-gray-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1556056504-5c7696c4c28d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')",
            backgroundPosition: "center",
            opacity: 0.5
          }}
        ></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            About Gambo Stadium
          </h1>
          <p className="text-xl max-w-3xl mx-auto">
            Professional football facilities in the heart of the city, dedicated to providing the best sporting experience.
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Our Story</h2>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <p className="text-lg mb-6">
              Founded in 2015, Gambo Stadium was created with a simple mission: to provide professional-quality football facilities to everyone from amateur enthusiasts to semi-professional teams.
            </p>
            <p className="text-lg mb-6">
              What began as a single football pitch has now grown into a comprehensive sports complex featuring multiple professional-grade grounds, training facilities, and an expert coaching staff.
            </p>
            <p className="text-lg">
              Today, we proudly serve thousands of football lovers each year, hosting matches, training sessions, and tournaments that bring communities together through the beautiful game.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 text-gambo">Our Mission</h3>
              <p>To make professional football facilities and training accessible to everyone, fostering a love for the sport and building community through shared passion.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 text-gambo">Our Vision</h3>
              <p>To become the premier destination for football enthusiasts, known for exceptional grounds, top-tier coaching, and an inclusive environment that welcomes players of all levels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Facilities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gambo-muted rounded-full flex items-center justify-center">
                <CalendarCheck className="h-8 w-8 text-gambo" />
              </div>
              <h3 className="text-xl font-bold mb-2">3 Professional Grounds</h3>
              <p className="text-gray-600">FIFA-standard pitches with premium artificial turf for consistent play in all seasons.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gambo-muted rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gambo" />
              </div>
              <h3 className="text-xl font-bold mb-2">Changing Rooms</h3>
              <p className="text-gray-600">Modern changing facilities with showers, lockers, and amenities for teams.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gambo-muted rounded-full flex items-center justify-center">
                <Award className="h-8 w-8 text-gambo" />
              </div>
              <h3 className="text-xl font-bold mb-2">Training Center</h3>
              <p className="text-gray-600">Dedicated space for our premium training programs with professional equipment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-6 text-gambo">Location & Hours</h3>
              
              <div className="flex items-start mb-4">
                <MapPin className="h-5 w-5 text-gambo shrink-0 mt-1" />
                <div className="ml-4">
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">123 Football Street, Sportsville, SP 12345</p>
                </div>
              </div>
              
              <div className="flex items-start mb-4">
                <Clock className="h-5 w-5 text-gambo shrink-0 mt-1" />
                <div className="ml-4">
                  <p className="font-medium">Business Hours</p>
                  <p className="text-gray-600">Monday - Friday: 8:00 AM - 10:00 PM</p>
                  <p className="text-gray-600">Saturday - Sunday: 7:00 AM - 11:00 PM</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-6 text-gambo">Get in Touch</h3>
              
              <div className="flex items-start mb-4">
                <Phone className="h-5 w-5 text-gambo shrink-0 mt-1" />
                <div className="ml-4">
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">(123) 456-7890</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gambo shrink-0 mt-1" />
                <div className="ml-4">
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">info@gambostadium.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
