
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, ArrowRight } from "lucide-react";

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  
  // In a real app, we would verify the payment using the Stripe session ID
  // and retrieve the booking details from the database
  useEffect(() => {
    // Check if we have booking details in the location state
    if (location.state?.date && location.state?.time && location.state?.ground) {
      setBookingDetails(location.state);
    } else {
      // If not, this would be a good place to verify the payment
      // using a session ID from URL parameters
      const mockBookingDetails = {
        date: "2025-04-30",
        time: "16:00 - 18:00",
        ground: "Premium Stadium",
        price: 140
      };
      setBookingDetails(mockBookingDetails);
    }
  }, [location]);

  const handleViewBookings = () => {
    navigate("/dashboard");
  };

  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <div className="max-w-lg mx-auto">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for your booking. We've sent a confirmation email with all the details.
        </p>
        
        {bookingDetails && (
          <div className="bg-gray-50 border rounded-lg p-6 mb-8">
            <h2 className="font-bold text-lg mb-4 flex items-center justify-center gap-2">
              <Calendar className="h-5 w-5 text-gambo" />
              Booking Details
            </h2>
            
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="text-gray-500">Ground:</div>
              <div className="font-medium">{bookingDetails.ground}</div>
              
              <div className="text-gray-500">Date:</div>
              <div className="font-medium">
                {new Date(bookingDetails.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              
              <div className="text-gray-500">Time:</div>
              <div className="font-medium">{bookingDetails.time}</div>
              
              <div className="text-gray-500">Amount Paid:</div>
              <div className="font-medium">${bookingDetails.price}</div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleViewBookings}
            className="bg-gambo hover:bg-gambo-dark flex items-center gap-2"
          >
            View My Bookings
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
