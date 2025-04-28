
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { connectToMongoDB, isMongoConnected } from "@/utils/mongoConfig";

interface MongoDBConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MongoDBConnectionDialog = ({ open, onOpenChange }: MongoDBConnectionDialogProps) => {
  const [mongoURL, setMongoURL] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Check if already connected
    if (isMongoConnected()) {
      setConnectionStatus('success');
    }
    
    // Get saved MongoDB URL
    const savedURL = localStorage.getItem('mongoURL');
    if (savedURL) {
      setMongoURL(savedURL);
    } else {
      setMongoURL("mongodb+srv://gambostadium:gambopass@alldbs.trd2b0u.mongodb.net/gambo");
    }
  }, [open]);

  const handleConnect = async () => {
    if (!mongoURL) {
      toast({
        title: "Error",
        description: "Please enter a MongoDB connection URL",
        variant: "destructive",
      });
      return;
    }

    setConnectionStatus('connecting');
    setIsConnecting(true);
    setErrorMessage("");

    try {
      const connected = await connectToMongoDB(mongoURL);
      
      if (connected) {
        localStorage.setItem('mongoURL', mongoURL);
        setConnectionStatus('success');
        toast({
          title: "Connected to MongoDB",
          description: "Successfully connected to the database",
        });
      } else {
        setConnectionStatus('error');
        setErrorMessage("Unable to connect to MongoDB. Make sure your backend server is running on http://localhost:5000");
        toast({
          title: "Connection Failed",
          description: "Unable to connect to MongoDB. Check that your backend server is running.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(`Error connecting: ${error instanceof Error ? error.message : "Unknown error"}`);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to MongoDB",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to MongoDB</DialogTitle>
          <DialogDescription>
            Enter your MongoDB connection URL to connect to the database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="mongoURL">MongoDB Connection URL</Label>
            <Input
              id="mongoURL"
              placeholder="mongodb://username:password@host:port/database"
              value={mongoURL}
              onChange={(e) => setMongoURL(e.target.value)}
              disabled={connectionStatus === 'connecting' || connectionStatus === 'success'}
            />
            <p className="text-xs text-gray-500">
              Make sure your Express backend server is running on port 5000.
            </p>
          </div>

          {connectionStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded p-3 flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span>Successfully connected to MongoDB</span>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-medium">Connection failed</p>
                <p className="text-sm">{errorMessage || "Unable to connect to MongoDB. Please check your connection URL and ensure the backend server is running."}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          {connectionStatus === 'success' ? (
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          ) : (
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting || !mongoURL} 
              className="w-full"
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MongoDBConnectionDialog;
