
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageSquare } from "lucide-react";

interface ContactCoachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachName: string;
}

const ContactCoachDialog = ({ open, onOpenChange, coachName }: ContactCoachDialogProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    // In a real app, this would send the message to the coach
    toast.success(`Message sent to ${coachName}`);
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contact Coach {coachName}</DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-gambo-muted flex items-center justify-center">
              <Mail className="h-6 w-6 text-gambo" />
            </div>
            <div>
              <h3 className="font-medium">Direct Message</h3>
              <p className="text-sm text-gray-600">
                Send a message to your coach about training or schedule
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-32"
            />
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
            onClick={handleSend}
            className="bg-gambo hover:bg-gambo-dark flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactCoachDialog;
