import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { BookingDay, TimeSlot, GroundType } from "@/types/booking";
import { groundsData } from "@/types/booking";
import { saveBooking } from "@/utils/bookingUtils";

const API_URL = "http://localhost:8000/api";

// Function to generate time slots
const generateTimeSlots = (
  startTime: number,
  endTime: number,
  interval: number,
  price: number
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  let current = startTime;
  while (current < endTime) {
    const end = current + interval;
    slots.push({
      id: `slot-${current}-${end}`,
      startTime: `${String(current).padStart(2, "0")}:00`,
      endTime: `${String(end).padStart(2, "0")}:00`,
      price: price,
    });
    current = end;
  }
  return slots;
};

// Function to generate booking days for the next 7 days
const generateBookingDays = (): BookingDay[] => {
  const bookingDays: BookingDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(new Date(), i);
    const dayName = format(date, "EEEE");
    const formattedDate = format(date, "yyyy-MM-dd");

    // Generate time slots for each day (adjust times and prices as needed)
    const slots = generateTimeSlots(8, 20, 2, 50);

    bookingDays.push({
      date: formattedDate,
      dayName: dayName,
      slots: slots,
    });
  }
  return bookingDays;
};

const BookingPage = () => {
  const navigate = useNavigate();
  const [selectedGround, setSelectedGround] = useState<string>(
    groundsData[0].id
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [bookingDays, setBookingDays] = useState<BookingDay[]>(
    generateBookingDays()
  );
  const [contactEmail, setContactEmail] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Handler for ground selection
  const handleGroundSelect = (groundId: string) => {
    setSelectedGround(groundId);
  };

  // Handler for date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  // Handler for time slot selection
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  // Function to proceed to the next booking step
  const nextStep = () => {
    setBookingStep(bookingStep + 1);
  };

  // Function to go back to the previous booking step
  const prevStep = () => {
    setBookingStep(bookingStep - 1);
  };

  // Function to handle contact information submission
  const handleContactSubmit = () => {
    if (!contactEmail) {
      toast.error("Please enter your contact email");
      return;
    }
    nextStep();
  };

  // Function to handle the final booking submission
  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error("Please select a date and time slot");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to make a booking");
      return;
    }

    setLoading(true);

    try {
      // Get the ground name from the selected ground ID
      const groundName =
        groundsData.find((g) => g.id === selectedGround)?.name ||
        "Unknown Ground";

      const bookingData = {
        userId: "", // You don't need to send userId from frontend anymore
        groundId: selectedGround,
        groundName: groundName,
        date: format(selectedDate, "yyyy-MM-dd"),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        price: selectedSlot.price,
        status: "confirmed",
      };

      console.log("Booking data to send:", bookingData);

      // Send the booking data to the backend with the token in the Authorization header
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send the token in the Authorization header
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Booking failed:", errorData);
        toast.error(errorData.message || "Booking failed");
        setLoading(false);
        return;
      }

      toast.success("Booking successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error during booking:", err);
      toast.error("An error occurred while booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Book a Ground</h1>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className={`step ${bookingStep === 1 ? "active" : ""}`}>
          1. Select Ground
        </div>
        <div className={`step ${bookingStep === 2 ? "active" : ""}`}>
          2. Select Date & Time
        </div>
        <div className={`step ${bookingStep === 3 ? "active" : ""}`}>
          3. Contact Information
        </div>
        <div className={`step ${bookingStep === 4 ? "active" : ""}`}>
          4. Confirm Booking
        </div>
      </div>

      {/* Step 1: Select Ground */}
      {bookingStep === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Select a Ground</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {groundsData.map((ground) => (
              <Card
                key={ground.id}
                className={`cursor-pointer ${
                  selectedGround === ground.id
                    ? "border-2 border-gambo"
                    : "hover:shadow-md"
                }`}
                onClick={() => handleGroundSelect(ground.id)}
              >
                <CardHeader>
                  <CardTitle>{ground.name}</CardTitle>
                  <CardDescription>{ground.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <img
                    src={ground.imageUrl}
                    alt={ground.name}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                  <ul className="list-disc pl-5">
                    {ground.facilities.map((facility, index) => (
                      <li key={index}>{facility}</li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleGroundSelect(ground.id)}
                    className={
                      selectedGround === ground.id
                        ? "bg-gambo hover:bg-gambo-dark"
                        : "text-gambo border-gambo"
                    }
                    variant={
                      selectedGround === ground.id ? "default" : "outline"
                    }
                  >
                    Select Ground
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="flex justify-end mt-8">
            <Button onClick={nextStep} className="bg-gambo hover:bg-gambo-dark">
              Next: Select Date & Time
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {bookingStep === 2 && (
        <div>
          <Button variant="outline" onClick={prevStep} className="mb-6">
            Back to Select Ground
          </Button>
          <h2 className="text-2xl font-bold mb-4">Select Date & Time</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-medium mb-4">Select a Date</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Choose a date for your booking</CardTitle>
                  <CardDescription>
                    Available dates are highlighted.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-4">Select a Time Slot</h3>
              {selectedDate ? (
                <div className="space-y-4">
                  {bookingDays
                    .filter(
                      (day) => format(selectedDate, "yyyy-MM-dd") === day.date
                    )[0]
                    ?.slots.map((slot) => (
                      <Card
                        key={slot.id}
                        className={`cursor-pointer ${
                          selectedSlot?.id === slot.id
                            ? "border-2 border-gambo"
                            : "hover:shadow-md"
                        }`}
                        onClick={() => handleTimeSlotSelect(slot)}
                      >
                        <CardHeader>
                          <CardTitle>
                            {slot.startTime} - {slot.endTime}
                          </CardTitle>
                          <CardDescription>
                            Price: ${slot.price}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button
                            onClick={() => handleTimeSlotSelect(slot)}
                            className={
                              selectedSlot?.id === slot.id
                                ? "bg-gambo hover:bg-gambo-dark"
                                : "text-gambo border-gambo"
                            }
                            variant={
                              selectedSlot?.id === slot.id
                                ? "default"
                                : "outline"
                            }
                          >
                            Select Time Slot
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              ) : (
                <Alert>
                  <AlertTitle>No Date Selected</AlertTitle>
                  <AlertDescription>
                    Please select a date to view available time slots.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button
              onClick={nextStep}
              className="bg-gambo hover:bg-gambo-dark"
              disabled={!selectedDate || !selectedSlot}
            >
              Next: Contact Information
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Contact Information */}
      {bookingStep === 3 && (
        <div>
          <Button variant="outline" onClick={prevStep} className="mb-6">
            Back to Select Date & Time
          </Button>
          <h2 className="text-2xl font-bold mb-4">Contact Information</h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="contactEmail"
                className="block text-sm font-medium text-gray-700"
              >
                Contact Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="contactEmail"
                  className="shadow-sm focus:ring-gambo focus:border-gambo block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="you@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="specialRequests"
                className="block text-sm font-medium text-gray-700"
              >
                Special Requests (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="specialRequests"
                  rows={3}
                  className="shadow-sm focus:ring-gambo focus:border-gambo block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Any special requests for your booking?"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button
              onClick={handleContactSubmit}
              className="bg-gambo hover:bg-gambo-dark"
              disabled={!contactEmail}
            >
              Next: Confirm Booking
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm Booking */}
      {bookingStep === 4 && (
        <div>
          <Button variant="outline" onClick={prevStep} className="mb-6">
            Back to Contact Information
          </Button>
          <h2 className="text-2xl font-bold mb-4">Confirm Your Booking</h2>

          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
              <CardDescription>
                Please review your booking details before confirming.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Ground:</p>
                  <p className="font-medium">
                    {groundsData.find((g) => g.id === selectedGround)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Date:</p>
                  <p className="font-medium">
                    {selectedDate
                      ? format(selectedDate, "MMMM d, yyyy")
                      : "No date selected"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Time Slot:</p>
                  <p className="font-medium">
                    {selectedSlot
                      ? `${selectedSlot.startTime} - ${selectedSlot.endTime}`
                      : "No time slot selected"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Price:</p>
                  <p className="font-medium">${selectedSlot?.price}</p>
                </div>
                <div>
                  <p className="text-gray-500">Contact Email:</p>
                  <p className="font-medium">{contactEmail}</p>
                </div>
                <div>
                  <p className="text-gray-500">Special Requests:</p>
                  <p className="font-medium">{specialRequests || "None"}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleBookingSubmit}
                className="w-full bg-gambo hover:bg-gambo-dark"
                disabled={loading}
              >
                {loading ? "Confirming Booking..." : "Confirm Booking"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <style>
        {`
        .step {
          @apply text-sm font-medium text-gray-500;
        }
        .step.active {
          @apply text-gambo;
        }
        `}
      </style>
    </div>
  );
};

export default BookingPage;
