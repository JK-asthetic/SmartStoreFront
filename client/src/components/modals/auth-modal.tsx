import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { Facebook, Mail } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView: "login" | "register";
  onSuccess: (loggedIn: boolean) => void;
}

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional().default(false),
});

const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthModal({ isOpen, onClose, initialView, onSuccess }: AuthModalProps) {
  const [view, setView] = useState<"login" | "register">(initialView);
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      terms: false,
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await apiRequest("POST", "/api/auth/login", data);
      toast({
        title: "Success",
        description: "You have been logged in successfully",
      });
      onSuccess(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      await apiRequest("POST", "/api/auth/register", {
        username: `${data.firstName}.${data.lastName}`.toLowerCase(),
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully",
      });
      
      // Auto login after registration
      await apiRequest("POST", "/api/auth/login", {
        email: data.email,
        password: data.password,
      });
      
      onSuccess(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const switchToLogin = () => {
    setView("login");
  };

  const switchToRegister = () => {
    setView("register");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {view === "login" ? (
          <>
            <DialogHeader>
              <div className="bg-primary -mx-6 -mt-6 p-6 rounded-t-lg">
                <div className="flex justify-between items-center mb-4">
                  <DialogTitle className="text-white font-poppins font-semibold text-2xl">
                    Sign In
                  </DialogTitle>
                </div>
                <div className="flex space-x-4 mb-4">
                  <Button 
                    variant="default" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Facebook className="mr-2 h-4 w-4" /> Facebook
                  </Button>
                  <Button 
                    variant="default" 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Mail className="mr-2 h-4 w-4" /> Google
                  </Button>
                </div>
                <div className="flex items-center">
                  <div className="flex-grow border-t border-white/20"></div>
                  <p className="mx-4 text-white/80 text-sm">OR</p>
                  <div className="flex-grow border-t border-white/20"></div>
                </div>
              </div>
            </DialogHeader>
            
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between items-center">
                  <FormField
                    control={loginForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                          />
                        </FormControl>
                        <FormLabel className="text-sm cursor-pointer">Remember me</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <Button variant="link" className="text-accent p-0 h-auto">
                    Forgot password?
                  </Button>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-secondary hover:bg-secondary/90 text-white" 
                  disabled={loginForm.formState.isSubmitting}
                >
                  {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
                
                <p className="text-center text-gray-600">
                  Don't have an account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 text-accent h-auto" 
                    onClick={switchToRegister}
                  >
                    Sign Up
                  </Button>
                </p>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="bg-primary -mx-6 -mt-6 p-6 rounded-t-lg">
                <div className="flex justify-between items-center mb-4">
                  <DialogTitle className="text-white font-poppins font-semibold text-2xl">
                    Create Account
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>
            
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 8 characters long and include a number and a special character.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I agree to the{" "}
                          <a href="#" className="text-accent hover:underline">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-accent hover:underline">
                            Privacy Policy
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-secondary hover:bg-secondary/90 text-white" 
                  disabled={registerForm.formState.isSubmitting}
                >
                  {registerForm.formState.isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
                
                <p className="text-center text-gray-600">
                  Already have an account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 text-accent h-auto" 
                    onClick={switchToLogin}
                  >
                    Sign In
                  </Button>
                </p>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
