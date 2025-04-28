// MongoDB connection utilities
// This connects to a real MongoDB through our Express API

// Update this API_URL to match where your backend is running
const API_URL = "http://localhost:8000/api";

export const connectToMongoDB = (mongoURL: string): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log(`Attempting to connect to MongoDB with URL: ${mongoURL}`);

    // Store the MongoDB URL for future reference
    localStorage.setItem("mongoURL", mongoURL);

    // Test the connection by fetching users
    fetch(`${API_URL}/users`)
      .then((response) => {
        if (response.ok) {
          localStorage.setItem("mongoConnected", "true");
          console.log("MongoDB connection successful");
          resolve(true);
        } else {
          throw new Error("Failed to connect to MongoDB API");
        }
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        localStorage.setItem("mongoConnected", "false");
        resolve(false);
      });
  });
};

export const disconnectFromMongoDB = (): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log("Disconnecting from MongoDB...");
    localStorage.removeItem("mongoConnected");
    console.log("MongoDB disconnected");
    resolve(true);
  });
};

export const isMongoConnected = (): boolean => {
  return localStorage.getItem("mongoConnected") === "true";
};

export const getMongoURL = (): string | null => {
  return localStorage.getItem("mongoURL");
};

// User CRUD Operations
export const saveUserToMongoDB = async (userData: any): Promise<boolean> => {
  if (!isMongoConnected()) {
    console.error("MongoDB not connected");
    return false;
  }

  try {
    console.log("Attempting to save user to MongoDB:", userData);

    // Check if user exists by email
    const checkResponse = await fetch(
      `${API_URL}/users/email/${userData.email}`
    );

    if (checkResponse.ok) {
      // User exists, update
      const user = await checkResponse.json();
      const updateResponse = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      return updateResponse.ok;
    } else {
      // User doesn't exist, create new
      const createResponse = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error("Error creating user:", errorData);
        return false;
      }

      return createResponse.ok;
    }
  } catch (err) {
    console.error("Error saving user to MongoDB:", err);
    return false;
  }
};

export const getUserFromMongoDBByEmail = async (
  email: string
): Promise<any | null> => {
  if (!isMongoConnected()) {
    console.error("MongoDB not connected");
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/users/email/${email}`);

    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (err) {
    console.error("Error fetching user from MongoDB:", err);
    return null;
  }
};

export const getAllUsersFromMongoDB = async (): Promise<any[]> => {
  if (!isMongoConnected()) {
    console.error("MongoDB not connected");
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/users`);

    if (response.ok) {
      return await response.json();
    }

    return [];
  } catch (err) {
    console.error("Error getting all users from MongoDB:", err);
    return [];
  }
};

// Booking CRUD Operations
export const saveBookingToMongoDB = async (
  bookingData: any
): Promise<boolean> => {
  if (!isMongoConnected()) {
    console.error("MongoDB not connected");
    return false;
  }

  try {
    console.log("Saving booking to MongoDB:", bookingData);
    const response = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error saving booking:", errorData);
    }

    return response.ok;
  } catch (err) {
    console.error("Error saving booking to MongoDB:", err);
    return false;
  }
};

export const getBookingsFromMongoDBByUserId = async (
  userId: string
): Promise<any[]> => {
  if (!isMongoConnected()) {
    console.error("MongoDB not connected");
    return [];
  }

  try {
    console.log(`Fetching bookings for user: ${userId}`);
    const response = await fetch(`${API_URL}/bookings/user/${userId}`);

    if (response.ok) {
      const bookings = await response.json();
      console.log(
        `Retrieved ${bookings.length} bookings for user ${userId}:`,
        bookings
      );
      return bookings;
    }

    console.error("Failed to fetch bookings, response not OK");
    return [];
  } catch (err) {
    console.error("Error fetching bookings from MongoDB:", err);
    return [];
  }
};

export const getAllBookingsFromMongoDB = async (): Promise<any[]> => {
  if (!isMongoConnected()) {
    console.error("MongoDB not connected");
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/bookings`);

    if (response.ok) {
      return await response.json();
    }

    return [];
  } catch (err) {
    console.error("Error getting all bookings from MongoDB:", err);
    return [];
  }
};

// Premium Team CRUD Operations
export const savePremiumTeamToMongoDB = async (
  teamData: any
): Promise<boolean> => {
  if (!isMongoConnected()) {
    console.error("MongoDB not connected");
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/premiumTeams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(teamData),
    });

    return response.ok;
  } catch (err) {
    console.error("Error saving premium team to MongoDB:", err);
    return false;
  }
};

export const getPremiumTeamsFromMongoDBByUserId = async (
  userId: string
): Promise<any[]> => {
  if (!isMongoConnected()) {
    console.error("MongoDB not connected");
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/premiumTeams/user/${userId}`);

    if (response.ok) {
      return await response.json();
    }

    return [];
  } catch (err) {
    console.error("Error fetching premium teams from MongoDB:", err);
    return [];
  }
};

export const getAllPremiumTeamsFromMongoDB = async (): Promise<any[]> => {
  if (!isMongoConnected()) {
    console.error("MongoDB not connected");
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/premiumTeams`);

    if (response.ok) {
      return await response.json();
    }

    return [];
  } catch (err) {
    console.error("Error getting all premium teams from MongoDB:", err);
    return [];
  }
};
