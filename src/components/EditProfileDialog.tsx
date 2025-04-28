
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProfileForm from "./ProfileForm";
import { toast } from "@/components/ui/sonner";
import { User } from "@/types/auth";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

const EditProfileDialog = ({ open, onOpenChange, user }: EditProfileDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (values: any) => {
    setIsLoading(true);
    
    // Get current user data
    const userData = localStorage.getItem('user');
    
    if (userData && user) {
      try {
        // Parse the user data
        const parsedUser = JSON.parse(userData);
        
        // Update the user data
        const updatedUser = {
          ...parsedUser,
          name: values.name,
          email: values.email,
          phone: values.phone || parsedUser.phone,
          location: values.location || parsedUser.location,
        };
        
        // Save the updated user data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Show success message
        toast.success("Profile updated successfully");
        
        // Close the dialog
        onOpenChange(false);
      } catch (e) {
        console.error("Error updating profile", e);
        toast.error("Failed to update profile");
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("No user data found");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <ProfileForm
          initialData={{
            name: user?.name || "",
            email: user?.email || "",
            phone: (user as any)?.phone || "",
            location: (user as any)?.location || "",
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
