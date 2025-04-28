import { User } from "@/types/auth";
import {
  isMongoConnected,
  getAllUsersFromMongoDB,
  saveUserToMongoDB,
  getAllBookingsFromMongoDB,
  getBookingsFromMongoDBByUserId,
  getAllPremiumTeamsFromMongoDB,
  getPremiumTeamsFromMongoDBByUserId,
} from "@/utils/mongoConfig";

// Types for admin dashboard
export interface AdminBooking {
  id: string;
  userId: string;
  userName: string;
  groundName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "pending" | "confirmed" | "cancelled";
}

export interface PremiumTeam {
  id: string;
  coach: string;
  package: string;
  startDate: string;
  endDate: string;
  trainingDays: string[];
  players: { name: string; age: string }[];
  userId?: string; // Add userId to track which user created this team
}

export interface Coach {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  availability: string[];
}

// Service functions - Now more careful with checking data and using MongoDB
export const fetchUsers = async (): Promise<User[]> => {
  try {
    // First check if MongoDB is connected
    const mongoConnected = isMongoConnected();

    // Get the current user
    const userData = localStorage.getItem("user");
    const currentUser = userData ? JSON.parse(userData) : null;

    // Create a mock users array if necessary
    let allUsers: User[] = [];

    // If MongoDB is connected, try to get users from there first
    if (mongoConnected) {
      const mongoUsers = await getAllUsersFromMongoDB();

      if (mongoUsers.length > 0) {
        // We have MongoDB users, use them
        allUsers = mongoUsers;

        // Ensure current user is included
        if (
          currentUser &&
          !allUsers.some((user) => user.id === currentUser.id)
        ) {
          allUsers.push(currentUser);
          // Save current user to MongoDB if not already there
          await saveUserToMongoDB(currentUser);
        }
      }
    }

    // If no users yet (or MongoDB not connected), add sample data
    if (allUsers.length === 0 && currentUser) {
      allUsers.push(currentUser);

      // Add sample users if admin
      if (currentUser.role === "admin") {
        allUsers = [
          ...allUsers,
          {
            id: "user1",
            name: "John Smith",
            email: "john.smith@example.com",
            role: "user",
            active: true,
            createdAt: "2025-02-15T10:20:30Z",
          },
          {
            id: "user2",
            name: "Emma Johnson",
            email: "emma.johnson@example.com",
            role: "user",
            active: true,
            createdAt: "2025-03-01T14:25:10Z",
          },
          {
            id: "user3",
            name: "Michael Brown",
            email: "michael.brown@example.com",
            role: "user",
            active: false,
            createdAt: "2025-03-20T09:15:45Z",
          },
        ];
      }
    }

    // Store users in MongoDB simulation
    if (allUsers.length > 0 && mongoConnected) {
      for (const user of allUsers) {
        await saveUserToMongoDB(user);
      }
    }

    return allUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const fetchBookings = async (): Promise<AdminBooking[]> => {
  try {
    // Get the current user to filter by user ID
    const userData = localStorage.getItem("user");
    const currentUser = userData ? JSON.parse(userData) : null;

    if (!currentUser) {
      return [];
    }

    // Check if MongoDB is connected
    const mongoConnected = isMongoConnected();
    if (!mongoConnected) {
      console.error("MongoDB not connected");
      return [];
    }

    // For admin users, show all bookings
    if (currentUser?.role === "admin") {
      const allBookings = await getAllBookingsFromMongoDB();
      return allBookings.map((booking) => ({
        ...booking,
        userName: booking.userName || "Unknown User",
        status: booking.status || "pending",
      }));
    }

    // For regular users, show only their bookings
    const userBookings = await getBookingsFromMongoDBByUserId(currentUser.id);
    return userBookings.map((booking) => ({
      ...booking,
      userName: currentUser.name,
      status: booking.status || "pending",
    }));
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
};

export const fetchPremiumTeams = async (): Promise<PremiumTeam[]> => {
  try {
    // Get the current user to filter by user ID
    const userData = localStorage.getItem("user");
    const currentUser = userData ? JSON.parse(userData) : null;

    if (!currentUser) {
      return [];
    }

    // Check if MongoDB is connected
    const mongoConnected = isMongoConnected();
    if (!mongoConnected) {
      console.error("MongoDB not connected");
      return [];
    }

    // For admin users, show all teams
    if (currentUser?.role === "admin") {
      return await getAllPremiumTeamsFromMongoDB();
    }

    // For regular users, show only their teams
    return await getPremiumTeamsFromMongoDBByUserId(currentUser.id);
  } catch (error) {
    console.error("Error fetching premium teams:", error);
    return [];
  }
};

export const fetchCoaches = async (): Promise<Coach[]> => {
  try {
    const coachesData = localStorage.getItem("coaches");

    if (coachesData) {
      return JSON.parse(coachesData);
    }

    // If no coaches in localStorage, return sample coaches
    const sampleCoaches: Coach[] = [
      {
        id: "c1",
        name: "Maria Rodriguez",
        specialization: "Elite Training",
        experience: "10 years",
        availability: ["Monday", "Wednesday", "Friday"],
      },
      {
        id: "c2",
        name: "David Wilson",
        specialization: "Youth Development",
        experience: "8 years",
        availability: ["Tuesday", "Thursday", "Saturday"],
      },
    ];

    // Store sample coaches in localStorage
    localStorage.setItem("coaches", JSON.stringify(sampleCoaches));
    return sampleCoaches;
  } catch (error) {
    console.error("Error fetching coaches:", error);
    return [];
  }
};

export const createCoach = async (
  coachData: Omit<Coach, "id">
): Promise<Coach> => {
  try {
    const newCoach: Coach = {
      ...coachData,
      id: `c-${Date.now()}`,
    };

    // Get existing coaches
    const coachesData = localStorage.getItem("coaches");
    const coaches = coachesData ? JSON.parse(coachesData) : [];

    // Add new coach
    coaches.push(newCoach);

    // Save back to localStorage
    localStorage.setItem("coaches", JSON.stringify(coaches));

    return newCoach;
  } catch (error) {
    console.error("Error creating coach:", error);
    throw new Error("Failed to create coach");
  }
};

export const createPremiumProgram = async (programData: {
  package: string;
  coach: string;
  startDate: string;
  endDate: string;
  trainingDays: string[];
}): Promise<PremiumTeam> => {
  try {
    const userData = localStorage.getItem("user");
    const currentUser = userData ? JSON.parse(userData) : null;

    const newProgram: PremiumTeam = {
      ...programData,
      id: `pt-${Date.now()}`,
      players: [],
      userId: currentUser?.id,
    };

    // Get existing programs
    const teamsData = localStorage.getItem("all_premiumTeams");
    const teams = teamsData ? JSON.parse(teamsData) : [];

    // Add new program
    teams.push(newProgram);

    // Save back to localStorage
    localStorage.setItem("all_premiumTeams", JSON.stringify(teams));

    return newProgram;
  } catch (error) {
    console.error("Error creating program:", error);
    throw new Error("Failed to create premium program");
  }
};

export const updateUserStatus = async (
  userId: string,
  active: boolean
): Promise<boolean> => {
  try {
    // Get all users
    const allUsersData = localStorage.getItem("all_users");
    if (allUsersData) {
      const users = JSON.parse(allUsersData);

      // Find and update the user
      const updatedUsers = users.map((user: User) =>
        user.id === userId ? { ...user, active } : user
      );

      // Save back to localStorage
      localStorage.setItem("all_users", JSON.stringify(updatedUsers));

      // If MongoDB is connected, update there too
      if (isMongoConnected()) {
        const userToUpdate = updatedUsers.find(
          (user: User) => user.id === userId
        );
        if (userToUpdate) {
          await saveUserToMongoDB(userToUpdate);
        }
      }

      // If this is the current user, update that too
      const userData = localStorage.getItem("user");
      if (userData) {
        const currentUser = JSON.parse(userData);
        if (currentUser.id === userId) {
          localStorage.setItem(
            "user",
            JSON.stringify({ ...currentUser, active })
          );
        }
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error("Error updating user status:", error);
    return false;
  }
};

// Function to handle exporting booking data as CSV
export const exportBookingsToCSV = (bookings: AdminBooking[]): void => {
  // Create CSV content
  const headers = [
    "ID",
    "User",
    "Ground",
    "Date",
    "Start Time",
    "End Time",
    "Price",
    "Status",
  ];
  let csvContent = headers.join(",") + "\n";

  bookings.forEach((booking) => {
    const row = [
      booking.id,
      booking.userName,
      booking.groundName,
      booking.date,
      booking.startTime,
      booking.endTime,
      booking.price,
      booking.status,
    ];

    // Escape any fields with commas by wrapping in quotes
    const escapedRow = row.map((field) => {
      const str = String(field);
      return str.includes(",") ? `"${str}"` : str;
    });

    csvContent += escapedRow.join(",") + "\n";
  });

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `bookings-export-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to view all premium programs
export const getAllPremiumPrograms = async (): Promise<string[]> => {
  try {
    const teams = await fetchPremiumTeams();
    return [...new Set(teams.map((team) => team.package))]; // Extract unique package names
  } catch (error) {
    console.error("Error getting premium programs:", error);
    return [];
  }
};
