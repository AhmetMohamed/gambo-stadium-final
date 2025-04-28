
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Clock, CreditCard, MapPin } from "lucide-react";
import { toast } from "sonner";

interface BookingType {
  id: string;
  groundName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "confirmed" | "pending" | "cancelled";
}

interface BookingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingType | null;
}

const BookingDetailsDialog = ({ open, onOpenChange, booking }: BookingDetailsDialogProps) => {
  if (!booking) return null;

  const handleCancelBooking = () => {
    // Get existing bookings from localStorage
    const bookingsData = localStorage.getItem('bookings');
    if (bookingsData) {
      try {
        const bookings = JSON.parse(bookingsData);
        // Find and update the status of the current booking
        const updatedBookings = bookings.map((b: BookingType) => 
          b.id === booking.id ? { ...b, status: "cancelled" } : b
        );
        
        // Save back to localStorage
        localStorage.setItem('bookings', JSON.stringify(updatedBookings));
        
        // Show success message
        toast.success("Booking cancelled successfully");
        
        // Close the dialog
        onOpenChange(false);
        
        // Force page reload to update the UI
        window.location.reload();
      } catch (e) {
        console.error("Error updating booking", e);
        toast.error("Failed to cancel booking");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{booking.groundName}</h3>
            <span
              className={`text-sm px-2 py-1 rounded ${
                booking.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : booking.status === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gambo" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p>{format(new Date(booking.date), "EEEE, MMMM d, yyyy")}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gambo" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p>{booking.startTime} - {booking.endTime}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gambo" />
              <div>
                <p className="text-sm text-gray-500">Facility</p>
                <p>{booking.groundName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gambo" />
              <div>
                <p className="text-sm text-gray-500">Payment</p>
                <p>${booking.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-6">
            <h4 className="font-medium mb-2">Booking Reference</h4>
            <p className="text-sm bg-gray-100 p-2 rounded">{booking.id}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {new Date(booking.date) > new Date() && booking.status !== "cancelled" && (
            <Button variant="destructive" onClick={handleCancelBooking}>Cancel Booking</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsDialog;
