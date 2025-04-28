
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface BookingDay {
  date: string;
  dayName: string;
  slots: TimeSlot[];
}

export interface Booking {
  id: string;
  userId: string;
  groundId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentId?: string;
  createdAt: string;
}

export interface GroundType {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  facilities: string[];
}

// Sample ground data with valid image URLs
export const groundsData: GroundType[] = [
  {
    id: "ground1",
    name: "Premium Stadium",
    description: "Professional-grade stadium with full amenities and seating for spectators.",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    facilities: ["Floodlights", "Changing Rooms", "Spectator Seating", "Parking"]
  },
  {
    id: "ground2",
    name: "Training Ground",
    description: "Dedicated training pitch ideal for team practice and skill development.",
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    facilities: ["Training Equipment", "Floodlights", "Basic Changing Facilities"]
  },
  {
    id: "ground3",
    name: "Community Pitch",
    description: "Local ground perfect for casual games and community events.",
    imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    facilities: ["Basic Amenities", "Parking", "Water Fountains"]
  }
];
