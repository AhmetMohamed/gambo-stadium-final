import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SignupData } from "@/types/auth";
import { isMongoConnected, saveUserToMongoDB } from "@/utils/mongoConfig";
import MongoDBConnectionButton from "@/components/MongoDBConnectionButton";

const SignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mongoConnected, setMongoConnected] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Check MongoDB connection status
    setMongoConnected(isMongoConnected());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError(null);

  //   if (!validateForm()) {
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     // Check MongoDB connection
  //     if (!mongoConnected) {
  //       toast({
  //         title: "MongoDB Not Connected",
  //         description: "Connect to MongoDB to ensure your data is saved properly.",
  //         variant: "destructive",
  //       });
  //       setIsLoading(false);
  //       return;
  //     }

  //     // Create user data
  //     const userData = {
  //       id: "user" + Math.random().toString(36).substr(2, 9),
  //       name: formData.name,
  //       email: formData.email,
  //       password: formData.password,
  //       role: "user",
  //       active: true,
  //       createdAt: new Date().toISOString()
  //     };

  //     // Save user to MongoDB
  //     const saved = await saveUserToMongoDB(userData);

  //     if (!saved) {
  //       toast({
  //         title: "Error",
  //         description: "Failed to save user data to MongoDB.",
  //         variant: "destructive",
  //       });
  //       setIsLoading(false);
  //       return;
  //     }

  //     // Store authentication token and user data
  //     localStorage.setItem("token", "mock-jwt-token");
  //     localStorage.setItem("user", JSON.stringify(userData));

  //     toast({
  //       title: "Account created",
  //       description: "Your account has been successfully created and saved to MongoDB.",
  //     });

  //     navigate("/dashboard");
  //   } catch (err) {
  //     setError("Failed to create account. Please try again.");
  //     console.error("Signup error:", err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Send the user data to the backend
      const response = await fetch("http://localhost:8000/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create account. Please try again.");
        return;
      }

      const { token, user } = data;

      // Store authentication token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast({
        title: "Account created",
        description: "Your account has been successfully created.",
      });

      navigate("/dashboard");
    } catch (err) {
      setError("Error during account creation. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="w-20 h-20 mx-auto rounded-full bg-gambo flex items-center justify-center">
            <span className="text-white font-bold text-xl">GS</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-gambo hover:text-gambo-dark"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="flex justify-center">
          <MongoDBConnectionButton />
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex p-4 bg-red-50 border border-red-200 rounded-md items-center text-red-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4 rounded-md">
            <div>
              <Label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1"
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gambo hover:bg-gambo-dark text-white"
            disabled={isLoading || !mongoConnected}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>

          {!mongoConnected && (
            <p className="text-amber-600 text-sm text-center">
              Please connect to MongoDB before creating an account
            </p>
          )}

          <p className="text-xs text-center text-gray-500">
            By signing up, you agree to our{" "}
            <Link to="/terms" className="text-gambo hover:text-gambo-dark">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-gambo hover:text-gambo-dark">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
