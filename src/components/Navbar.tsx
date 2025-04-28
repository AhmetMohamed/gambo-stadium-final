import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  isAdmin?: boolean;
}

const Navbar = ({ isAdmin = false }: NavbarProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitials, setUserInitials] = useState("");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const getUserData = () => {
    const token = localStorage.getItem("token");
    const userDataStr = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        const initials = userData.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        setUserInitials(initials);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  };

  useEffect(() => {
    // Refresh user data whenever location changes or component mounts
    getUserData();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserInitials("");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/booking", label: "Book Ground" },
    { href: "/premium", label: "Premium Training" },
    ...(isLoggedIn ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(isLoggedIn && isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-gambo">Gambo Stadium</span>
          </Link>
        </div>

        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="mt-8 flex flex-col gap-4">
                {isLoggedIn && (
                  <div className="mb-4 flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-gambo">
                      <AvatarFallback className="text-black">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-black">My Account</span>
                  </div>
                )}

                {links.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="font-medium text-gray-600 transition-colors hover:text-gambo"
                  >
                    {link.label}
                  </Link>
                ))}

                {isLoggedIn ? (
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="justify-start p-0 font-medium text-gray-600 hover:bg-transparent hover:text-gambo"
                  >
                    Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/login">
                      <Button variant="ghost" className="w-full justify-start">
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="w-full bg-gambo hover:bg-gambo-dark">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center gap-6">
            <nav className="flex gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="font-medium text-gray-600 transition-colors hover:text-gambo"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Avatar className="h-8 w-8 bg-gambo">
                    <AvatarFallback className="bg-gambo text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="font-medium text-gray-600 hover:text-gambo"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-gambo hover:bg-gambo-dark">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
