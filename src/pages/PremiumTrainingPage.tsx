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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Award,
  Check,
  X,
  Users,
  Calendar,
  UserCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/sonner";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

type Coach = {
  id: string;
  name: string;
  experience: string;
  specialty: string;
  image: string;
  available: boolean;
};

type PricingTier = {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  color: string;
  recommended: boolean;
};

const coaches: Coach[] = [
  {
    id: "coach1",
    name: "Alex Johnson",
    experience: "15+ years",
    specialty: "Youth Development",
    image:
      "https://images.unsplash.com/photo-1553867745-6e038d085e86?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    available: true,
  },
  {
    id: "coach2",
    name: "Maria Rodriguez",
    experience: "12 years",
    specialty: "Technical Skills",
    image: "https://unsplash.com/photos/a-man-holding-a-basketball-trsGnHAzfsw",
    available: true,
  },
  {
    id: "coach3",
    name: "David Chen",
    experience: "8 years",
    specialty: "Goalkeeping",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    available: true,
  },
  {
    id: "coach4",
    name: "Sarah Williams",
    experience: "10 years",
    specialty: "Team Strategy",
    image:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    available: false,
  },
];

const pricingTiers: PricingTier[] = [
  {
    id: "basic",
    name: "Basic Package",
    price: 60,
    duration: "1 month",
    features: [
      "1 training session per week",
      "Basic equipment provided",
      "Group coaching (max 12 players)",
      "Performance feedback",
    ],
    color: "bg-gray-100",
    recommended: false,
  },
  {
    id: "premium",
    name: "Premium Package",
    price: 120,
    duration: "1 month",
    features: [
      "2 training sessions per week",
      "All equipment provided",
      "Smaller group coaching (max 8 players)",
      "Detailed performance analysis",
      "Video review sessions",
      "Priority booking",
    ],
    color: "bg-gambo-muted",
    recommended: true,
  },
  {
    id: "elite",
    name: "Elite Package",
    price: 180,
    duration: "1 month",
    features: [
      "3 training sessions per week",
      "Premium equipment provided",
      "Semi-private coaching (max 4 players)",
      "Advanced performance analytics",
      "Personalized development plan",
      "Nutritional guidance",
      "Priority booking",
    ],
    color: "bg-amber-50",
    recommended: false,
  },
];

const trainingDays = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
];

const PremiumTrainingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("premium");
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [playerCount, setPlayerCount] = useState<number>(6);
  const [players, setPlayers] = useState<{ name: string; age: string }[]>(
    Array(6)
      .fill(null)
      .map(() => ({ name: "", age: "" }))
  );

  const handlePlayerChange = (
    index: number,
    field: "name" | "age",
    value: string
  ) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], [field]: value };
    setPlayers(updatedPlayers);
  };

  const handleDaySelection = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      if (selectedDays.length < 3) {
        setSelectedDays([...selectedDays, day]);
      }
    }
  };

  const handleEnrollment = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    const playersValid = players
      .slice(0, playerCount)
      .every((p) => p.name && p.age);
    if (!selectedCoach || selectedDays.length === 0 || !playersValid) {
      toast.error("Please complete all required fields before proceeding");
      return;
    }

    setIsLoading(true);

    try {
      const premiumTraining = {
        package:
          pricingTiers.find((p) => p.id === selectedPackage)?.name ||
          "Premium Package",
        coach: coaches.find((c) => c.id === selectedCoach)?.name || "",
        trainingDays: selectedDays.map(
          (d) => trainingDays.find((day) => day.id === d)?.label || ""
        ),
        players: players.slice(0, playerCount),
        startDate: new Date().toISOString().split("T")[0], // today's date
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      };

      const token = localStorage.getItem("token");
      const decoded = jwtDecode<DecodedToken>(token);
      const userId = decoded.id;

      console.log(userId);

      // ⚡ Send POST request to your backend
      await axios.post("http://localhost:8000/api/premiumteams", {
        ...premiumTraining,
        userId: userId, // Send userId (you must have it from login)
      });

      localStorage.setItem("premiumTraining", JSON.stringify(premiumTraining));
      localStorage.setItem("hasBookings", "true");

      toast.success("Premium training enrollment successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to enroll in premium training");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="relative bg-gradient-to-r from-gambo to-green-700 text-white rounded-xl overflow-hidden mb-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517466787929-bc90951d0974?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
          }}
        ></div>
        <div className="relative px-6 py-12 md:py-16 md:px-12">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-8 w-8" />
            <h2 className="text-xl font-bold">Premium Training Programs</h2>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Elevate Your Game with Expert Coaching
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mb-8">
            Join our professional training programs led by experienced coaches.
            Whether you're just starting out or looking to take your skills to
            the next level, we have the perfect program for you.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="secondary"
              className="bg-white text-gambo hover:bg-gray-100"
            >
              Learn More
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              View Schedule
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-center mb-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? "bg-gambo text-white" : "bg-gray-200"
            }`}
          >
            1
          </div>
          <div
            className={`h-1 w-16 mx-1 ${
              step >= 2 ? "bg-gambo" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? "bg-gambo text-white" : "bg-gray-200"
            }`}
          >
            2
          </div>
          <div
            className={`h-1 w-16 mx-1 ${
              step >= 3 ? "bg-gambo" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? "bg-gambo text-white" : "bg-gray-200"
            }`}
          >
            3
          </div>
        </div>
        <div className="flex justify-center text-sm">
          <div className="w-32 text-center">Choose Package</div>
          <div className="w-32 text-center">Training Details</div>
          <div className="w-32 text-center">Player Information</div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Select Your Training Package
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingTiers.map((tier) => (
                <Card
                  key={tier.id}
                  className={`cursor-pointer transition-all ${
                    selectedPackage === tier.id
                      ? "border-2 border-gambo shadow-md"
                      : "hover:shadow-md"
                  } ${tier.recommended ? "relative" : ""}`}
                  onClick={() => setSelectedPackage(tier.id)}
                >
                  {tier.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gambo px-3 py-1 rounded-full text-white text-xs font-medium">
                      Recommended
                    </div>
                  )}
                  <div className={`p-4 rounded-t-lg ${tier.color}`}>
                    <CardHeader className="pb-2">
                      <CardTitle>{tier.name}</CardTitle>
                      <CardDescription>
                        <span className="text-2xl font-bold">
                          ${tier.price}
                        </span>
                        <span className="text-sm"> / {tier.duration}</span>
                      </CardDescription>
                    </CardHeader>
                  </div>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-gambo mt-0.5 shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => {
                        setSelectedPackage(tier.id);
                        setStep(2);
                      }}
                      variant={
                        selectedPackage === tier.id ? "default" : "outline"
                      }
                      className={`w-full ${
                        selectedPackage === tier.id
                          ? "bg-gambo hover:bg-gambo-dark"
                          : "text-gambo border-gambo"
                      }`}
                    >
                      Select
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                className="bg-gambo hover:bg-gambo-dark"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="mb-6"
            >
              Back to Package Selection
            </Button>

            <h2 className="text-2xl font-bold mb-6">
              Select Coach & Training Days
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-gambo" />
                  Choose Your Coach
                </h3>

                <RadioGroup
                  value={selectedCoach}
                  onValueChange={setSelectedCoach}
                  className="space-y-3"
                >
                  {coaches.map((coach) => (
                    <div
                      key={coach.id}
                      className={`flex items-center space-x-4 p-3 border rounded-lg transition-all ${
                        selectedCoach === coach.id
                          ? "border-gambo bg-gambo-muted"
                          : "hover:border-gambo"
                      } ${!coach.available ? "opacity-50" : ""}`}
                    >
                      <RadioGroupItem
                        value={coach.id}
                        id={coach.id}
                        disabled={!coach.available}
                      />
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={coach.image}
                          alt={coach.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <Label
                          htmlFor={coach.id}
                          className={`font-medium block ${
                            !coach.available ? "text-gray-500" : ""
                          }`}
                        >
                          {coach.name} {!coach.available && "(Unavailable)"}
                        </Label>
                        <div className="text-sm text-gray-600 flex flex-col sm:flex-row sm:gap-4">
                          <span>{coach.experience} experience</span>
                          <span>Specializes in: {coach.specialty}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gambo" />
                  Choose Training Days
                </h3>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-4">
                    Select up to 3 days per week for your training sessions
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {trainingDays.map((day) => (
                      <div
                        key={day.id}
                        className={`flex items-center p-3 border rounded-md cursor-pointer transition-all ${
                          selectedDays.includes(day.id)
                            ? "border-gambo bg-gambo-muted"
                            : "hover:border-gambo hover:bg-gray-50"
                        }`}
                        onClick={() => handleDaySelection(day.id)}
                      >
                        <Checkbox
                          id={`day-${day.id}`}
                          checked={selectedDays.includes(day.id)}
                          onCheckedChange={() => handleDaySelection(day.id)}
                          className="mr-3"
                        />
                        <Label
                          htmlFor={`day-${day.id}`}
                          className="cursor-pointer flex-grow"
                        >
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    Selected: {selectedDays.length} / 3 days
                  </p>
                </div>
              </div>
            </div>

            {(selectedCoach === "" || selectedDays.length === 0) && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select a coach and at least one training day to
                  continue.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="bg-gambo hover:bg-gambo-dark"
                disabled={selectedCoach === "" || selectedDays.length === 0}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="mb-6"
            >
              Back to Schedule Selection
            </Button>

            <h2 className="text-2xl font-bold mb-6">Player Information</h2>

            <div className="mb-6">
              <Label htmlFor="playerCount" className="block mb-2">
                Number of Players (Max 6)
              </Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setPlayerCount(Math.max(1, playerCount - 1))}
                  disabled={playerCount <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="w-16 px-3 py-2 border rounded-md text-center">
                  {playerCount}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setPlayerCount(Math.min(6, playerCount + 1))}
                  disabled={playerCount >= 6}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {Array.from({ length: playerCount }).map((_, index) => (
                <div key={index} className="border rounded-md p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-gambo" />
                    Player {index + 1}
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`player-name-${index}`}>Full Name</Label>
                      <Input
                        id={`player-name-${index}`}
                        value={players[index]?.name || ""}
                        onChange={(e) =>
                          handlePlayerChange(index, "name", e.target.value)
                        }
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`player-age-${index}`}>Age</Label>
                      <Input
                        id={`player-age-${index}`}
                        value={players[index]?.age || ""}
                        onChange={(e) =>
                          handlePlayerChange(index, "age", e.target.value)
                        }
                        placeholder="e.g. 15"
                        type="number"
                        min="5"
                        max="50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-4">Enrollment Summary</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Package:</p>
                  <p className="font-medium">
                    {pricingTiers.find((p) => p.id === selectedPackage)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Price:</p>
                  <p className="font-medium">
                    ${pricingTiers.find((p) => p.id === selectedPackage)?.price}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Coach:</p>
                  <p className="font-medium">
                    {coaches.find((c) => c.id === selectedCoach)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Training Days:</p>
                  <p className="font-medium">
                    {selectedDays
                      .map(
                        (d) => trainingDays.find((day) => day.id === d)?.label
                      )
                      .join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Players:</p>
                  <p className="font-medium">{playerCount}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                onClick={handleEnrollment}
                className="bg-gambo hover:bg-gambo-dark flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Complete Enrollment"}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">
              What age groups are the training programs suitable for?
            </h3>
            <p className="text-gray-600">
              Our programs are designed for players aged 6 to 18, with specific
              coaching approaches tailored to each age group's developmental
              needs.
            </p>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">
              Can I change my training schedule after enrollment?
            </h3>
            <p className="text-gray-600">
              Yes, you can request schedule changes with at least 7 days'
              notice, subject to availability.
            </p>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">
              What happens if a session is cancelled due to weather?
            </h3>
            <p className="text-gray-600">
              All weather-cancelled sessions are automatically rescheduled or
              credited to your account.
            </p>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">
              Do you offer individual coaching options?
            </h3>
            <p className="text-gray-600">
              Yes, we offer one-on-one coaching sessions for players seeking
              personalized attention. Please contact us for rates and
              availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumTrainingPage;
