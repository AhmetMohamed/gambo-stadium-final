
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import MongoDBConnectionDialog from "./MongoDBConnectionDialog";
import { isMongoConnected } from "@/utils/mongoConfig";

const MongoDBConnectionButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const connected = isMongoConnected();

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className={`flex items-center gap-2 ${
          connected ? "border-green-500 text-green-500" : "border-amber-500 text-amber-500"
        }`}
        size="sm"
      >
        <Database className="h-4 w-4" />
        <span>{connected ? "MongoDB Connected" : "Connect MongoDB"}</span>
      </Button>
      
      <MongoDBConnectionDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </>
  );
};

export default MongoDBConnectionButton;
