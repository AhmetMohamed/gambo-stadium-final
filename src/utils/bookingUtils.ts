import { toast } from "sonner";
import type { Booking } from "@/types/booking";
import { saveBookingToMongoDB, isMongoConnected, getUserFromMongoDBByEmail } from "@/utils/mongoConfig";

/**
 * Save a booking to MongoDB via API
 */
export const saveBooking = async (bookingData: {
  groundId: string;
  groundName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}) => {
  const userData = localStorage.getItem('user');
  if (!userData) {
    toast.error("You must be logged in to make a booking");
    return false;
  }
  
  const user = JSON.parse(userData);
  const userId = user.id;
  const userName = user.name || "Unknown User";
  
  if (!userId) {
    toast.error("User ID not available. Please log in again.");
    return false;
  }
  
  // Check if MongoDB connection is established
  if (!isMongoConnected()) {
    toast.error("Database connection is required. Please connect to MongoDB first.");
    return false;
  }

  try {
    // Generate a new booking with a unique ID
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      userId: userId,
      groundId: bookingData.groundId,
      date: bookingData.date,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      price: bookingData.price,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // Save to MongoDB via API
    const bookingWithGroundName = {
      ...newBooking,
      groundName: bookingData.groundName,
      userName: userName
    };
    
    console.log("Saving booking with data:", bookingWithGroundName);
    
    const result = await saveBookingToMongoDB(bookingWithGroundName);
    
    if (result) {
      toast.success("Booking saved successfully!");
      return true;
    } else {
      toast.error("Failed to save booking information");
      return false;
    }
  } catch (error) {
    console.error("Error saving booking:", error);
    toast.error("Failed to save booking information");
    return false;
  }
};
