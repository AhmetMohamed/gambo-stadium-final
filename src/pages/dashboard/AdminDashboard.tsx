import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  Book,
  Award,
  Calendar,
  Search,
  CheckCircle,
  Activity,
  CalendarRange,
  User,
  DollarSign,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import {
  fetchUsers,
  fetchBookings,
  fetchPremiumTeams,
  fetchCoaches,
  createCoach,
  createPremiumProgram,
  updateUserStatus,
  exportBookingsToCSV,
  getAllPremiumPrograms,
  type AdminBooking,
  type PremiumTeam,
  type Coach,
} from "@/services/adminService";
import { User as UserType } from "@/types/auth";
import { toast } from "@/components/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [showAllProgramsDialog, setShowAllProgramsDialog] = useState(false);
  const [bookingFilter, setBookingFilter] = useState("all");
  const [showCreateCoachDialog, setShowCreateCoachDialog] = useState(false);
  const [showCreateProgramDialog, setShowCreateProgramDialog] = useState(false);
  const [newCoach, setNewCoach] = useState({
    name: "",
    specialization: "",
    experience: "",
    availability: [] as string[],
  });
  const [newProgram, setNewProgram] = useState({
    package: "",
    coach: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    trainingDays: [] as string[],
  });

  // Fetch data using React Query with error handling
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: fetchBookings,
  });

  const { data: premiumTeams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ["admin-premium-teams"],
    queryFn: fetchPremiumTeams,
  });

  const { data: allPrograms = [], isLoading: programsLoading } = useQuery({
    queryKey: ["admin-premium-programs"],
    queryFn: getAllPremiumPrograms,
  });

  const { data: coaches = [], isLoading: coachesLoading } = useQuery({
    queryKey: ["coaches"],
    queryFn: fetchCoaches,
  });

  // Calculate stats from real data
  const stats = {
    totalUsers: users.length || 0,
    activeUsers: users.filter((user) => user.active).length || 0,
    totalBookings: bookings.length || 0,
    pendingBookings:
      bookings.filter((booking) => booking.status === "pending").length || 0,
    revenueWeekly: bookings
      .filter((booking) => {
        const bookingDate = new Date(booking.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return bookingDate >= weekAgo;
      })
      .reduce((acc, booking) => acc + booking.price, 0),
    revenueMonthly: bookings
      .filter((booking) => {
        const bookingDate = new Date(booking.date);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return bookingDate >= monthAgo;
      })
      .reduce((acc, booking) => acc + booking.price, 0),
    premiumTeams: premiumTeams.length || 0,
    premiumPlayers: premiumTeams.reduce(
      (acc, team) => acc + (team.players?.length || 0),
      0
    ),
  };

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter bookings based on selected filter
  const filteredBookings = bookings.filter((booking) => {
    if (!booking.date) return false;
    console.log(booking);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);

    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);

    switch (bookingFilter) {
      case "today":
        return bookingDate.getTime() === today.getTime();
      case "thisWeek":
        return bookingDate >= today && bookingDate <= weekLater;
      case "pending":
        return booking.status === "pending";
      case "confirmed":
        return booking.status === "confirmed";
      default:
        return true; // "all" filter
    }
  });

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, active }: { userId: string; active: boolean }) =>
      updateUserStatus(userId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update user status");
    },
  });

  // Create coach mutation
  const createCoachMutation = useMutation({
    mutationFn: createCoach,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast.success("Coach created successfully");
      setShowCreateCoachDialog(false);
      setNewCoach({
        name: "",
        specialization: "",
        experience: "",
        availability: [],
      });
    },
    onError: () => {
      toast.error("Failed to create coach");
    },
  });

  // Create program mutation
  const createProgramMutation = useMutation({
    mutationFn: createPremiumProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-premium-teams"] });
      queryClient.invalidateQueries({ queryKey: ["admin-premium-programs"] });
      toast.success("Premium program created successfully");
      setShowCreateProgramDialog(false);
      setNewProgram({
        package: "",
        coach: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        trainingDays: [],
      });
    },
    onError: () => {
      toast.error("Failed to create premium program");
    },
  });

  // Handle exporting bookings data
  const handleExportData = () => {
    if (bookings.length === 0) {
      toast.error("No booking data available to export");
      return;
    }

    exportBookingsToCSV(bookings);
    toast.success("Booking data exported successfully");
  };

  // Sort users
  const handleSort = (field: string) => {
    const newDirection =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortField === "bookings") {
      const aCount = bookings.filter(
        (booking) => booking.userId === a.id
      ).length;
      const bCount = bookings.filter(
        (booking) => booking.userId === b.id
      ).length;
      return sortDirection === "asc" ? aCount - bCount : bCount - aCount;
    }

    const valueA =
      a[sortField as keyof UserType]?.toString().toLowerCase() || "";
    const valueB =
      b[sortField as keyof UserType]?.toString().toLowerCase() || "";

    return sortDirection === "asc"
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  });

  // Handle coach form submission
  const handleCreateCoach = () => {
    if (
      !newCoach.name ||
      !newCoach.specialization ||
      !newCoach.experience ||
      newCoach.availability.length === 0
    ) {
      toast.error("Please fill all fields");
      return;
    }

    createCoachMutation.mutate(newCoach);
  };

  // Handle program form submission
  const handleCreateProgram = () => {
    if (
      !newProgram.package ||
      !newProgram.coach ||
      !newProgram.startDate ||
      !newProgram.endDate ||
      newProgram.trainingDays.length === 0
    ) {
      toast.error("Please fill all fields");
      return;
    }

    createProgramMutation.mutate(newProgram);
  };

  // Handle availability checkbox changes
  const handleAvailabilityChange = (day: string) => {
    setNewCoach((prev) => {
      if (prev.availability.includes(day)) {
        return {
          ...prev,
          availability: prev.availability.filter((d) => d !== day),
        };
      } else {
        return {
          ...prev,
          availability: [...prev.availability, day],
        };
      }
    });
  };

  // Handle training days checkbox changes
  const handleTrainingDaysChange = (day: string) => {
    setNewProgram((prev) => {
      if (prev.trainingDays.includes(day)) {
        return {
          ...prev,
          trainingDays: prev.trainingDays.filter((d) => d !== day),
        };
      } else {
        return {
          ...prev,
          trainingDays: [...prev.trainingDays, day],
        };
      }
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-gambo text-white py-1 px-3">
            Admin
          </Badge>
          <Button variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-gambo" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.activeUsers}/{stats.totalUsers}
            </div>
            <p className="text-sm text-gray-500">Active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gambo" />
              Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBookings}</div>
            <p className="text-sm text-gray-500">
              {stats.pendingBookings} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-gambo" />
              Premium Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.premiumTeams}</div>
            <p className="text-sm text-gray-500">
              {stats.premiumPlayers} players enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gambo" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.revenueMonthly}</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="h-4 w-4" />
              <span>12% this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="premium">Premium Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all registered users
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading users data...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 bg-muted p-3 rounded-t-md font-medium text-sm">
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      Name
                      {sortField === "name" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => handleSort("email")}
                    >
                      Email
                      {sortField === "email" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                    <div>Member Since</div>
                    <div
                      className="flex items-center gap-1 cursor-pointer text-center"
                      onClick={() => handleSort("bookings")}
                    >
                      Bookings
                      {sortField === "bookings" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                    <div className="text-center">Status</div>
                  </div>

                  <div>
                    {sortedUsers.length > 0 ? (
                      sortedUsers.map((user, index) => (
                        <div
                          key={user.id}
                          className={`grid grid-cols-5 p-3 items-center ${
                            index < sortedUsers.length - 1 ? "border-b" : ""
                          }`}
                        >
                          <div>{user.name}</div>
                          <div className="text-sm">{user.email}</div>
                          <div>
                            {user.createdAt
                              ? format(new Date(user.createdAt), "MMM d, yyyy")
                              : "N/A"}
                          </div>
                          <div className="text-center">
                            {
                              bookings.filter(
                                (booking) => booking.userId === user.id
                              ).length
                            }
                          </div>
                          <div className="flex justify-center">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={user.active}
                                onCheckedChange={() => {
                                  updateUserStatusMutation.mutate({
                                    userId: user.id,
                                    active: !user.active,
                                  });
                                }}
                                id={`user-active-${user.id}`}
                              />
                              <Label htmlFor={`user-active-${user.id}`}>
                                {user.active ? (
                                  <span className="text-green-600 text-sm">
                                    Active
                                  </span>
                                ) : (
                                  <span className="text-red-600 text-sm">
                                    Inactive
                                  </span>
                                )}
                              </Label>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        {searchTerm
                          ? `No users found matching "${searchTerm}"`
                          : "No users available"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>
                View and manage all ground bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading bookings data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                    <Badge
                      variant={bookingFilter === "all" ? "default" : "outline"}
                      className={
                        bookingFilter === "all"
                          ? "bg-gambo text-white cursor-pointer"
                          : "cursor-pointer"
                      }
                      onClick={() => setBookingFilter("all")}
                    >
                      All
                    </Badge>
                    <Badge
                      variant={
                        bookingFilter === "today" ? "default" : "outline"
                      }
                      className={
                        bookingFilter === "today"
                          ? "bg-gambo text-white cursor-pointer"
                          : "cursor-pointer"
                      }
                      onClick={() => setBookingFilter("today")}
                    >
                      Today
                    </Badge>
                    <Badge
                      variant={
                        bookingFilter === "thisWeek" ? "default" : "outline"
                      }
                      className={
                        bookingFilter === "thisWeek"
                          ? "bg-gambo text-white cursor-pointer"
                          : "cursor-pointer"
                      }
                      onClick={() => setBookingFilter("thisWeek")}
                    >
                      This Week
                    </Badge>
                    <Badge
                      variant={
                        bookingFilter === "pending" ? "default" : "outline"
                      }
                      className={
                        bookingFilter === "pending"
                          ? "bg-gambo text-white cursor-pointer"
                          : "cursor-pointer"
                      }
                      onClick={() => setBookingFilter("pending")}
                    >
                      Pending
                    </Badge>
                    <Badge
                      variant={
                        bookingFilter === "confirmed" ? "default" : "outline"
                      }
                      className={
                        bookingFilter === "confirmed"
                          ? "bg-gambo text-white cursor-pointer"
                          : "cursor-pointer"
                      }
                      onClick={() => setBookingFilter("confirmed")}
                    >
                      Confirmed
                    </Badge>
                  </div>

                  <div className="rounded-md border">
                    <div className="grid grid-cols-6 bg-muted p-3 rounded-t-md font-medium text-sm">
                      <div>User</div>
                      <div>Ground</div>
                      <div>Date</div>
                      <div>Time</div>
                      <div className="text-center">Price</div>
                      <div className="text-center">Status</div>
                    </div>

                    <div>
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking, index) => {
                          return (
                            <div
                              key={booking.id}
                              className={`grid grid-cols-6 p-3 items-center ${
                                index < filteredBookings.length - 1
                                  ? "border-b"
                                  : ""
                              }`}
                            >
                              <div className="text-sm font-medium">
                                {booking.userId || "Unknown"}
                              </div>
                              <div className="text-sm">
                                {booking.groundName}
                              </div>
                              <div className="text-sm">
                                {booking.date
                                  ? format(
                                      new Date(booking.date),
                                      "MMM d, yyyy"
                                    )
                                  : "N/A"}
                              </div>
                              <div className="text-sm">
                                {booking.startTime || "N/A"} -{" "}
                                {booking.endTime || "N/A"}
                              </div>
                              <div className="text-center font-medium">
                                ${booking.price}
                              </div>
                              <div className="flex justify-center">
                                <Badge
                                  variant="outline"
                                  className={`${
                                    booking.status === "confirmed"
                                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                                      : booking.status === "cancelled"
                                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                                      : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                  }`}
                                >
                                  {booking.status === "confirmed" ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Activity className="h-3 w-3 mr-1" />
                                  )}
                                  {booking.status}
                                </Badge>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No bookings found matching the selected filter
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleExportData}>
                Export Data
              </Button>
              <Button className="bg-gambo hover:bg-gambo-dark">
                Add Manual Booking
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="premium">
          <Card>
            <CardHeader>
              <CardTitle>Premium Training Teams</CardTitle>
              <CardDescription>
                View and manage premium training programs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teamsLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading premium teams data...</p>
                </div>
              ) : premiumTeams.length > 0 ? (
                <div className="space-y-4">
                  {premiumTeams.map((team) => (
                    <div
                      key={team.id}
                      className="border rounded-md overflow-hidden"
                    >
                      <div
                        className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
                        onClick={() =>
                          setExpandedTeam(
                            expandedTeam === team.id ? null : team.id
                          )
                        }
                      >
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            <Award className="h-5 w-5 text-gambo" />
                            {team.package}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Coach: {team.coach}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {team.startDate && team.endDate
                                ? `${format(
                                    new Date(team.startDate),
                                    "MMM d"
                                  )} - ${format(
                                    new Date(team.endDate),
                                    "MMM d, yyyy"
                                  )}`
                                : "Dates not available"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {team.players
                                ? `${team.players.length} players`
                                : "0 players"}
                            </p>
                          </div>
                          <div>
                            {expandedTeam === team.id ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {expandedTeam === team.id && (
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div>
                              <h4 className="font-medium mb-2">
                                Training Details
                              </h4>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <CalendarRange className="h-4 w-4 text-gambo" />
                                  <span>
                                    Training days:{" "}
                                    {team.trainingDays
                                      ? team.trainingDays.join(", ")
                                      : "Not specified"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gambo" />
                                  <span>Coach: {team.coach}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gambo" />
                                  <span>
                                    Start:{" "}
                                    {team.startDate
                                      ? format(
                                          new Date(team.startDate),
                                          "MMMM d, yyyy"
                                        )
                                      : "Not set"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gambo" />
                                  <span>
                                    End:{" "}
                                    {team.endDate
                                      ? format(
                                          new Date(team.endDate),
                                          "MMMM d, yyyy"
                                        )
                                      : "Not set"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Team Players</h4>
                              <div className="space-y-1">
                                {team.players && team.players.length > 0 ? (
                                  team.players.map((player, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between border-b py-1 last:border-0"
                                    >
                                      <span>{player.name}</span>
                                      <span className="text-sm text-gray-500">
                                        Age: {player.age}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-gray-500">
                                    No players enrolled yet
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              Edit Details
                            </Button>
                            <Button variant="outline" size="sm">
                              Contact Team
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No premium teams available
                  </p>
                  <Button
                    className="bg-gambo hover:bg-gambo-dark"
                    onClick={() => setShowCreateProgramDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Program
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowAllProgramsDialog(true)}
              >
                View All Programs
              </Button>
              <Button
                className="bg-gambo hover:bg-gambo-dark"
                onClick={() => setShowCreateProgramDialog(true)}
              >
                Create Program
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for All Programs */}
      <Dialog
        open={showAllProgramsDialog}
        onOpenChange={setShowAllProgramsDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>All Premium Training Programs</DialogTitle>
            <DialogDescription>
              Available premium training programs and packages
            </DialogDescription>
          </DialogHeader>

          {programsLoading ? (
            <div className="flex justify-center py-4">
              <p>Loading programs...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program Name</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Total Players</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPrograms.length > 0 ? (
                  allPrograms.map((program, index) => {
                    const teamsInProgram = premiumTeams.filter(
                      (team) => team.package === program
                    );
                    const playersCount = teamsInProgram.reduce(
                      (acc, team) => acc + (team.players?.length || 0),
                      0
                    );

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{program}</TableCell>
                        <TableCell>{teamsInProgram.length}</TableCell>
                        <TableCell>{playersCount}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-4 text-gray-500"
                    >
                      No premium programs available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog for Creating a Coach */}
      <Dialog
        open={showCreateCoachDialog}
        onOpenChange={setShowCreateCoachDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Coach</DialogTitle>
            <DialogDescription>
              Create a new coach for premium training programs
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coach-name">Coach Name</Label>
              <Input
                id="coach-name"
                placeholder="Enter coach name"
                value={newCoach.name}
                onChange={(e) =>
                  setNewCoach({ ...newCoach, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coach-specialization">Specialization</Label>
              <Input
                id="coach-specialization"
                placeholder="e.g. Youth Development"
                value={newCoach.specialization}
                onChange={(e) =>
                  setNewCoach({ ...newCoach, specialization: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coach-experience">Experience (Years)</Label>
              <Input
                id="coach-experience"
                placeholder="e.g. 5 years"
                value={newCoach.experience}
                onChange={(e) =>
                  setNewCoach({ ...newCoach, experience: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Availability</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={newCoach.availability.includes(day)}
                      onCheckedChange={() => handleAvailabilityChange(day)}
                    />
                    <label
                      htmlFor={`day-${day}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateCoachDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCoach}>Create Coach</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Creating a Premium Program */}
      <Dialog
        open={showCreateProgramDialog}
        onOpenChange={setShowCreateProgramDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Program</DialogTitle>
            <DialogDescription>
              Create a new premium training program
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="program-name">Program Name</Label>
              <Input
                id="program-name"
                placeholder="e.g. Elite Training"
                value={newProgram.package}
                onChange={(e) =>
                  setNewProgram({ ...newProgram, package: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="program-coach">Select Coach</Label>
              <div className="flex gap-2">
                <Select
                  value={newProgram.coach}
                  onValueChange={(value) =>
                    setNewProgram({ ...newProgram, coach: value })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select coach" />
                  </SelectTrigger>
                  <SelectContent>
                    {coaches.map((coach) => (
                      <SelectItem key={coach.id} value={coach.name}>
                        {coach.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateProgramDialog(false);
                    setShowCreateCoachDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newProgram.startDate}
                  onChange={(e) =>
                    setNewProgram({ ...newProgram, startDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newProgram.endDate}
                  onChange={(e) =>
                    setNewProgram({ ...newProgram, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Training Days</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`training-${day}`}
                      checked={newProgram.trainingDays.includes(day)}
                      onCheckedChange={() => handleTrainingDaysChange(day)}
                    />
                    <label
                      htmlFor={`training-${day}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateProgramDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateProgram}>Create Program</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
