import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, CheckCircle, User, Calendar as CalendarIcon, CreditCard, Award, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import MongoDBConnectionButton from "@/components/MongoDBConnectionButton";
import { toast } from "sonner";
import EditProfileDialog from "@/components/EditProfileDialog";
import BookingDetailsDialog from "@/components/BookingDetailsDialog";
import TrainingDetailsDialog from "@/components/TrainingDetailsDialog";
import ChangeTrainingDayDialog from "@/components/ChangeTrainingDayDialog";
import ContactCoachDialog from "@/components/ContactCoachDialog";
import { getBookingsFromMongoDBByUserId, getPremiumTeamsFromMongoDBByUserId, saveBookingToMongoDB } from "@/utils/mongoConfig";
import { isMongoConnected } from "@/utils/mongoConfig";

const trainingDaysOptions = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
];

interface BookingType {
  id: string;
  userId?: string;
  groundName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "confirmed" | "pending" | "cancelled";
}

interface PremiumTrainingType {
  package: string;
  coach: string;
  trainingDays: string[];
  players: { name: string; age: string }[];
  nextSession: string;
  sessionsRemaining: number;
  status: "active" | "cancelled" | "pending";
  endDate: string;
  userId?: string;
}

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [premiumTraining, setPremiumTraining] = useState<PremiumTrainingType | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(true);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null);
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);
  const [trainingDetailsOpen, setTrainingDetailsOpen] = useState(false);
  const [changeTrainingDayOpen, setChangeTrainingDayOpen] = useState(false);
  const [contactCoachOpen, setContactCoachOpen] = useState(false);
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        if (isMongoConnected()) {
          getBookingsFromMongoDBByUserId(parsedUser.id).then(userBookings => {
            if (userBookings.length > 0) {
              setBookings(userBookings);
              setIsNewUser(false);
            } else {
              setIsNewUser(true);
            }
          });
          
          getPremiumTeamsFromMongoDBByUserId(parsedUser.id).then(teams => {
            if (teams.length > 0) {
              const team = teams[0];
              setPremiumTraining({
                package: team.package,
                coach: team.coach,
                trainingDays: team.trainingDays,
                players: team.players,
                nextSession: new Date().toISOString().split('T')[0],
                sessionsRemaining: 8,
                status: "active",
                endDate: team.endDate,
                userId: team.userId
              });
              setIsNewUser(false);
            }
          });
        } else {
          toast.error("Please connect to MongoDB to view your data");
        }
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  const handleProfileDialogChange = (open: boolean) => {
    setProfileDialogOpen(open);
    
    if (!open) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      }
    }
  };

  const handleViewBookingDetails = (booking: BookingType) => {
    setSelectedBooking(booking);
    setBookingDetailsOpen(true);
  };

  const handleCancelBooking = (bookingId: string) => {
    const updatedBookings = bookings.map((b: BookingType) => 
      b.id === bookingId ? { ...b, status: "cancelled" as const } : b
    );
    setBookings(updatedBookings);
    
    const bookingToUpdate = updatedBookings.find(b => b.id === bookingId);
    if (bookingToUpdate && isMongoConnected()) {
      saveBookingToMongoDB(bookingToUpdate);
      toast.success("Booking cancelled successfully");
    } else {
      toast.error("Failed to cancel booking. Please check database connection.");
    }
  };

  const handleCancelPremiumTraining = () => {
    if (premiumTraining) {
      const updatedTraining: PremiumTrainingType = {
        ...premiumTraining,
        status: "cancelled" as const
      };
      setPremiumTraining(updatedTraining);
      
      localStorage.setItem('premiumTraining', JSON.stringify(updatedTraining));
      
      const allPremiumData = localStorage.getItem('all_premiumTeams');
      if (allPremiumData && user) {
        try {
          const allTeams = JSON.parse(allPremiumData);
          
          const updatedTeams = allTeams.map((team: any) => 
            team.userId === user.id ? { ...team, status: "cancelled" } : team
          );
          
          localStorage.setItem('all_premiumTeams', JSON.stringify(updatedTeams));
        } catch (e) {
          console.error("Error updating all_premiumTeams", e);
        }
      }
      
      toast.success("Premium training program cancelled successfully");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <MongoDBConnectionButton />
      </div>
      
      <EditProfileDialog 
        open={profileDialogOpen} 
        onOpenChange={handleProfileDialogChange} 
        user={user} 
      />
      
      <BookingDetailsDialog
        open={bookingDetailsOpen}
        onOpenChange={setBookingDetailsOpen}
        booking={selectedBooking}
      />

      <TrainingDetailsDialog
        open={trainingDetailsOpen}
        onOpenChange={setTrainingDetailsOpen}
        training={premiumTraining}
      />
      
      <ChangeTrainingDayDialog
        open={changeTrainingDayOpen}
        onOpenChange={setChangeTrainingDayOpen}
        currentDays={premiumTraining?.trainingDays.map(day => 
          trainingDaysOptions.find(d => d.label === day)?.id || ""
        ) || []}
      />
      
      <ContactCoachDialog
        open={contactCoachOpen}
        onOpenChange={setContactCoachOpen}
        coachName={premiumTraining?.coach || ""}
      />
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Your Bookings</TabsTrigger>
          <TabsTrigger value="training">Premium Training</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gambo" />
                  Upcoming Booking
                </CardTitle>
                <CardDescription>Next scheduled ground booking</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div>
                    <p className="font-medium">{bookings[0].groundName}</p>
                    <p className="text-gray-600">{format(new Date(bookings[0].date), "MMMM d, yyyy")}</p>
                    <p className="text-gray-600">{bookings[0].startTime} - {bookings[0].endTime}</p>
                    
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-700">{bookings[0].status}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <p className="text-gray-500 mb-4">No upcoming bookings</p>
                    <Link to="/booking">
                      <Button variant="outline" className="text-gambo border-gambo">Book Now</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setActiveTab("bookings")}
                >
                  View All Bookings
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-gambo" />
                  Training Status
                </CardTitle>
                <CardDescription>Your premium training program</CardDescription>
              </CardHeader>
              <CardContent>
                {premiumTraining ? (
                  <div>
                    <p className="font-medium">{premiumTraining.package}</p>
                    <p className="text-gray-600">Coach: {premiumTraining.coach}</p>
                    <p className="text-gray-600">Next Session: {format(new Date(premiumTraining.nextSession), "MMMM d")}</p>
                    
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-700">{premiumTraining.status}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <p className="text-gray-500 mb-4">No active training program</p>
                    <Link to="/premium">
                      <Button variant="outline" className="text-gambo border-gambo">Enroll Now</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setActiveTab("training")}
                >
                  View Training Details
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gambo" />
                  Account Status
                </CardTitle>
                <CardDescription>Your membership info</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{user?.role === 'admin' ? 'Admin' : 'Regular Member'}</p>
                <p className="text-gray-600">Member since {user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "April 2025"}</p>
                <p className="text-gray-600">Total bookings: {bookings.length}</p>
                
                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700">Active</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setProfileDialogOpen(true)}
                >
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
              
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 2).map((booking) => (
                    <div key={booking.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{booking.groundName}</p>
                          <div className="flex items-center gap-2 text-gray-600 mt-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{format(new Date(booking.date), "MMMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{booking.startTime} - {booking.endTime}</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">${booking.price}</span>
                          <div className={`flex items-center gap-1 mt-1 ${
                            booking.status === "confirmed" 
                              ? "text-green-700" 
                              : "text-amber-700"
                          }`}>
                            {booking.status === "confirmed" ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertTriangle className="h-4 w-4" />
                            )}
                            <span className="text-sm capitalize">{booking.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <p className="text-gray-500 mb-4">You haven't made any bookings yet</p>
                  <Link to="/booking">
                    <Button className="bg-gambo hover:bg-gambo-dark">Book a Ground</Button>
                  </Link>
                </div>
              )}
              
              {bookings.length > 0 && (
                <Button 
                  variant="link" 
                  className="mt-2 text-gambo" 
                  onClick={() => setActiveTab("bookings")}
                >
                  View all bookings
                </Button>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/booking">
                  <Button className="bg-gambo hover:bg-gambo-dark h-auto py-3 flex flex-col items-center gap-1 w-full">
                    <Calendar className="h-5 w-5" />
                    <span>Book Ground</span>
                  </Button>
                </Link>
                
                <Link to="/premium">
                  <Button variant="outline" className="border-gambo text-gambo h-auto py-3 flex flex-col items-center gap-1 w-full">
                    <Award className="h-5 w-5" />
                    <span>Premium Training</span>
                  </Button>
                </Link>
                
                <Button variant="outline" className="border-gambo text-gambo h-auto py-3 flex flex-col items-center gap-1">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment History</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-gambo text-gambo h-auto py-3 flex flex-col items-center gap-1"
                  onClick={() => setProfileDialogOpen(true)}
                >
                  <User className="h-5 w-5" />
                  <span>Edit Profile</span>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="bookings" className="mt-0">
          <h2 className="text-xl font-bold mb-6">Your Booking History</h2>
          
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{booking.groundName}</CardTitle>
                      <span className={`text-sm px-2 py-1 rounded ${
                        booking.status === "confirmed" 
                          ? "bg-green-100 text-green-800" 
                          : booking.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {booking.status === "confirmed" ? "Confirmed" : 
                         booking.status === "cancelled" ? "Cancelled" : "Pending"}
                      </span>
                    </div>
                    <CardDescription>Booking #{booking.id}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-gambo" />
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p>{format(new Date(booking.date), "MMMM d, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gambo" />
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p>{booking.startTime} - {booking.endTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-gambo" />
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p>${booking.price}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => handleViewBookingDetails(booking)}
                    >
                      View Details
                    </Button>
                    {new Date(booking.date) > new Date() && booking.status !== "cancelled" && (
                      <Button 
                        variant="destructive"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Bookings Found</h3>
              <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
              <Link to="/booking">
                <Button className="bg-gambo hover:bg-gambo-dark">Book a Ground Now</Button>
              </Link>
            </div>
          )}
          
          {bookings.length > 0 && (
            <div className="mt-6 text-center">
              <Link to="/booking">
                <Button className="bg-gambo hover:bg-gambo-dark">Book Another Session</Button>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="training" className="mt-0">
          {premiumTraining ? (
            <>
              <h2 className="text-xl font-bold mb-6">Your Premium Training Program</h2>
              
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-gambo" />
                        {premiumTraining.package}
                      </CardTitle>
                      <CardDescription>
                        Coached by {premiumTraining.coach}
                      </CardDescription>
                    </div>
                    <span className="text-sm px-2 py-1 rounded bg-green-100 text-green-800">
                      {premiumTraining.status.charAt(0).toUpperCase() + premiumTraining.status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">Program Details</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-gambo" />
                          <div>
                            <p className="text-sm text-gray-500">Schedule</p>
                            <p>{premiumTraining.trainingDays.join(", ")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-gambo" />
                          <div>
                            <p className="text-sm text-gray-500">Next Session</p>
                            <p>{format(new Date(premiumTraining.nextSession), "EEEE, MMMM d")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-gambo" />
                          <div>
                            <p className="text-sm text-gray-500">Sessions Remaining</p>
                            <p>{premiumTraining.sessionsRemaining} of 12</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-gambo" />
                          <div>
                            <p className="text-sm text-gray-500">Program End Date</p>
                            <p>{format(new Date(premiumTraining.endDate), "MMMM d, yyyy")}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">Registered Players</h3>
                      <div className="border rounded-md divide-y">
                        {premiumTraining.players.map((player, index) => (
                          <div key={index} className="flex items-center gap-2 p-3">
                            <div className="h-8 w-8 rounded-full bg-gambo-muted flex items-center justify-center text-gambo font-medium">
                              {player.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-sm text-gray-600">Age: {player.age}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => setTrainingDetailsOpen(true)}
                  >
                    View Details
                  </Button>
                  {premiumTraining.status === "active" && (
                    <>
                      <Button 
                        variant="outline"
                        onClick={() => setChangeTrainingDayOpen(true)}
                      >
                        Change Training Day
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setContactCoachOpen(true)}
                      >
                        Contact Coach
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
              
              {premiumTraining.status === "active" && (
                <div className="flex justify-center">
                  <Button 
                    variant="destructive"
                    onClick={handleCancelPremiumTraining}
                  >
                    Cancel Premium Program
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gambo-muted flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-gambo" />
              </div>
              <h2 className="text-xl font-bold mb-2">No Active Premium Program</h2>
              <p className="text-gray-600 mb-6">
                You don't have an active premium training program at the moment.
              </p>
              <Link to="/premium">
                <Button className="bg-gambo hover:bg-gambo-dark">
                  Enroll in Premium Training
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
