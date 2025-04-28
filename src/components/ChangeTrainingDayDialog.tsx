
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const trainingDays = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
];

interface ChangeTrainingDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDays: string[];
}

const ChangeTrainingDayDialog = ({ open, onOpenChange, currentDays }: ChangeTrainingDayDialogProps) => {
  const [selectedDays, setSelectedDays] = useState<string[]>(currentDays);

  const handleDaySelection = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      if (selectedDays.length < 3) {
        setSelectedDays([...selectedDays, day]);
      } else {
        toast.error("You can select up to 3 training days");
      }
    }
  };

  const handleSave = () => {
    if (selectedDays.length === 0) {
      toast.error("Please select at least one training day");
      return;
    }

    // Update training days in localStorage
    const trainingData = localStorage.getItem("premiumTraining");
    if (trainingData) {
      const training = JSON.parse(trainingData);
      training.trainingDays = selectedDays.map(d => 
        trainingDays.find(day => day.id === d)?.label || ""
      );
      localStorage.setItem("premiumTraining", JSON.stringify(training));
      
      toast.success("Training days updated successfully!");
      onOpenChange(false);
      
      // Refresh the page to show updated data
      window.location.reload();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Training Days</DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <p className="text-sm text-gray-600 mb-4">
            Select up to 3 days per week for your training sessions
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {trainingDays.map((day) => (
              <div 
                key={day.id}
                className={`flex items-center p-3 border rounded-md cursor-pointer transition-all ${
                  selectedDays.includes(day.id) 
                    ? 'border-gambo bg-gambo-muted' 
                    : 'hover:border-gambo hover:bg-gray-50'
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
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gambo hover:bg-gambo-dark"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeTrainingDayDialog;
