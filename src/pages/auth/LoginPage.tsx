import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { LoginCredentials } from "@/types/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError(null);
  //   setIsLoading(true);

  //   try {
  //     // This would be replaced with actual API call
  //     // await login(formData);
  //     console.log("Login attempt:", formData);

  //     // Simulate API delay
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     // Mock user data (replace with actual API response)
  //     const userData = {
  //       id: "user123",
  //       name: formData.email.split("@")[0],
  //       email: formData.email,
  //       role: formData.email.includes("admin") ? "admin" : "user",
  //     };

  //     // Store authentication token and user data
  //     localStorage.setItem("token", "mock-jwt-token");
  //     localStorage.setItem("user", JSON.stringify(userData));

  //     toast({
  //       title: "Login successful",
  //       description: "Welcome back to Gambo Stadium!",
  //     });

  //     // Redirect to appropriate dashboard based on role
  //     if (userData.role === "admin") {
  //       navigate("/admin");
  //     } else {
  //       navigate("/dashboard");
  //     }
  //   } catch (err) {
  //     setError("Invalid email or password. Please try again.");
  //     console.error("Login error:", err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password");
        return;
      }

      const { token, user } = data;

      // Store authentication token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Error during login. Please try again.");
      console.error("Login error:", err);
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/signup"
              className="font-medium text-gambo hover:text-gambo-dark"
            >
              create a new account
            </Link>
          </p>
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
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-gambo hover:text-gambo-dark"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gambo hover:bg-gambo-dark text-white"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-center text-xs text-gray-500">
            <p>For admin access, use an email containing "admin"</p>
            <p>Example: admin@example.com (any password)</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
