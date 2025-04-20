import { ClipboardList } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  id: number;
  username: string;
}

export default function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const { data: user, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include"
        });
        if (res.status === 401) return null;
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      } catch (error) {
        return null;
      }
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Logged in successfully",
        description: "Welcome back!",
      });
      refetch();
      setIsLoginOpen(false);
      setUsername("");
      setPassword("");
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Registered successfully",
        description: "Your account has been created!",
      });
      refetch();
      setIsRegisterOpen(false);
      setUsername("");
      setPassword("");
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try a different username",
        variant: "destructive",
      });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout", {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "See you again soon!",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleLogin = () => {
    if (!username || !password) {
      toast({
        title: "Missing information",
        description: "Please provide both username and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ username, password });
  };

  const handleRegister = () => {
    if (!username || !password) {
      toast({
        title: "Missing information",
        description: "Please provide both username and password",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate({ username, password });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ClipboardList className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-gray-900">QuizCraft</h1>
          </div>
          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user.username}</span>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Sign Out"}
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setIsLoginOpen(true)}
                className="bg-primary hover:bg-indigo-700 text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Login to QuizCraft</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setIsLoginOpen(false);
                setIsRegisterOpen(true);
              }}
            >
              Create Account
            </Button>
            <Button 
              onClick={handleLogin}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a new account</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-username">Username</Label>
              <Input
                id="new-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setIsRegisterOpen(false);
                setIsLoginOpen(true);
              }}
            >
              Back to Login
            </Button>
            <Button 
              onClick={handleRegister}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating Account..." : "Register"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
