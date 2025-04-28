import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Award, Calendar, Clock, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
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
}

interface TrainingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training: PremiumTrainingType | null;
}

const TrainingDetailsDialog = ({
  open,
  onOpenChange,
  training,
}: TrainingDetailsDialogProps) => {
  if (!training) return null;

  const handleCancelTraining = async () => {
    try {
      if (!training) return;

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication error. Please login again.");
        return;
      }

      const decoded = jwtDecode<{
        id: string;
        role: string;
        iat: number;
        exp: number;
      }>(token);
      const userId = decoded.id;

      // ✅ First, fetch the user's premium training team from the backend
      const res = await fetch(`/api/premiumteams/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch your premium team");
      }

      const teams = await res.json();

      if (teams.length === 0) {
        toast.error("No active premium training found.");
        return;
      }

      const teamId = teams[0]._id; // get the first premium team document (you can improve logic)

      // ✅ Now PATCH the premium team to update status to cancelled
      const patchRes = await fetch(`/api/premiumteams/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }), // Only update the status
      });

      if (!patchRes.ok) {
        throw new Error("Failed to cancel your premium training program.");
      }

      toast.success("Premium training program cancelled successfully!");

      onOpenChange(false);
      window.location.reload(); // Force page reload to refresh the UI
    } catch (e) {
      console.error("Error cancelling program", e);
      toast.error("Failed to cancel premium training program");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Premium Training Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{training.package}</h3>
            <span
              className={`text-sm px-2 py-1 rounded ${
                training.status === "active"
                  ? "bg-green-100 text-green-800"
                  : training.status === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {training.status.charAt(0).toUpperCase() +
                training.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gambo" />
                <div>
                  <p className="text-sm text-gray-500">Coach</p>
                  <p>{training.coach}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gambo" />
                <div>
                  <p className="text-sm text-gray-500">Next Session</p>
                  <p>
                    {format(
                      new Date(training.nextSession),
                      "EEEE, MMMM d, yyyy"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gambo" />
                <div>
                  <p className="text-sm text-gray-500">Training Days</p>
                  <p>{training.trainingDays.join(", ")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-gambo" />
                <div>
                  <p className="text-sm text-gray-500">Sessions</p>
                  <p>{training.sessionsRemaining} of 12 remaining</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Registered Players</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {training.players.map((player, index) => (
                    <TableRow key={index}>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>{player.age}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <h4 className="font-medium mb-2">Program Details</h4>
            <p className="text-sm">
              This premium training program runs until{" "}
              {format(new Date(training.endDate), "MMMM d, yyyy")}. Training
              sessions are scheduled on {training.trainingDays.join(", ")} with
              coach {training.coach}.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {training.status === "active" && (
            <Button variant="destructive" onClick={handleCancelTraining}>
              Cancel Program
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingDetailsDialog;
