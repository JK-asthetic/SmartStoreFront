import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UserCircle,
  MapPin,
  Package,
  Heart,
  CreditCard,
  LogOut,
  Shield,
  Bell,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Updated schema to match the API response structure
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  location: z.string().optional(),
  username: z.string().optional(),
  age: z.number().optional().nullable(),
  gender: z.string().optional().nullable(),
  customerSegment: z.string().optional().nullable(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Account() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest("GET", "/api/user/profile");
        if (response) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch user profile
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ["/api/user/profile"],
    onError: () => {
      // Redirect to login if not authenticated
      toast({
        title: "Authentication required",
        description: "Please log in to view your account",
        variant: "destructive",
      });
      navigate("/login");
    },
    enabled: isLoggedIn,
  });

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      location: "",
      username: "",
      age: null,
      gender: null,
      customerSegment: null,
    },
    values: user
      ? {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          location: user.location || "",
          username: user.username || "",
          age: user.age || null,
          gender: user.gender || null,
          customerSegment: user.customerSegment || null,
        }
      : undefined,
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      await apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      await apiRequest("PATCH", "/api/user/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully",
      });
      passwordForm.reset();
    },
    onError: () => {
      toast({
        title: "Update failed",
        description:
          "Failed to change your password. Please ensure your current password is correct.",
        variant: "destructive",
      });
    },
  });

  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["/api/user/orders"],
    enabled: isLoggedIn,
  });

  // Handle profile form submission
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Handle password form submission
  const onPasswordSubmit = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", undefined);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (userError) {
    return null; // Will redirect in the onError callback
  }

  if (!isLoggedIn) {
    return null; // Don't render anything until auth check is complete
  }

  return (
    <div className="pt-32 md:pt-36 pb-24 bg-background">
      <div className="container mx-auto px-6">
        <h1 className="font-poppins text-2xl md:text-3xl font-semibold text-primary mb-8">
          My Account
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UserCircle className="h-8 w-8" />
                  </div>
                  <div className="ml-4">
                    {isLoadingUser ? (
                      <>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </>
                    ) : (
                      <>
                        <CardTitle className="text-lg">
                          {user?.firstName} {user?.lastName}
                        </CardTitle>
                        <CardDescription>{user?.email}</CardDescription>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 -ml-2">
                  <li>
                    <Button
                      variant={activeTab === "profile" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("profile")}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant={activeTab === "orders" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("orders")}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Orders
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant={
                        activeTab === "addresses" ? "secondary" : "ghost"
                      }
                      className="w-full justify-start"
                      onClick={() => setActiveTab("addresses")}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Addresses
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant={activeTab === "wishlist" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("wishlist")}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant={activeTab === "payment" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("payment")}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment Methods
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant={activeTab === "security" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("security")}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Security
                    </Button>
                  </li>
                </ul>

                <Separator className="my-4" />

                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUser ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-40" />
                    </div>
                  ) : (
                    <Form {...profileForm}>
                      <form
                        onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value
                                          ? parseInt(e.target.value)
                                          : null
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending
                            ? "Saving..."
                            : "Save Changes"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Manage your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="password">
                    <TabsList className="mb-4">
                      <TabsTrigger value="password">
                        Change Password
                      </TabsTrigger>
                      <TabsTrigger value="2fa">
                        Two-Factor Authentication
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="password">
                      <Form {...passwordForm}>
                        <form
                          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            disabled={changePasswordMutation.isPending}
                          >
                            {changePasswordMutation.isPending
                              ? "Changing..."
                              : "Change Password"}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>

                    <TabsContent value="2fa">
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Two-factor authentication adds an extra layer of
                          security to your account. In addition to your
                          password, you'll need to enter a code from your phone.
                        </p>

                        <div className="flex items-start space-x-3 pt-4">
                          <Checkbox id="enable2fa" />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="enable2fa">
                              Enable two-factor authentication
                            </Label>
                            <p className="text-sm text-gray-500">
                              You will need to set up an authenticator app on
                              your phone.
                            </p>
                          </div>
                        </div>

                        <Button variant="outline" className="mt-4">
                          Set Up Two-Factor Authentication
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {activeTab === "orders" && (
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View and track your orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : orders?.length ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">Order #{order.id}</h4>
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  order.purchase_date
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="font-medium">
                              ${order.total_amount.toFixed(2)}
                            </p>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center text-sm"
                              >
                                <div className="flex items-center space-x-2">
                                  <span>{item.product_name}</span>
                                  <span className="text-gray-500">
                                    × {item.quantity}
                                  </span>
                                </div>
                                <span>
                                  ${item.price_at_purchase.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end pt-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        No orders yet
                      </h3>
                      <p className="text-gray-500 mb-6">
                        You haven't placed any orders yet. Start shopping to see
                        your orders here.
                      </p>
                      <Button asChild>
                        <a href="/products">Browse Products</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "wishlist" && (
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                  <CardDescription>
                    View and manage your wishlisted items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Your wishlist is empty
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Add items to your wishlist while browsing our store to
                      save them for later.
                    </p>
                    <Button asChild>
                      <a href="/products">Browse Products</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "addresses" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Saved Addresses</CardTitle>
                    <CardDescription>
                      Manage your shipping and billing addresses
                    </CardDescription>
                  </div>
                  <Button>Add New Address</Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No addresses saved
                    </h3>
                    <p className="text-gray-500 mb-6">
                      You haven't saved any addresses yet. Add your first
                      address to speed up checkout.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "payment" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Manage your saved payment methods
                    </CardDescription>
                  </div>
                  <Button>Add Payment Method</Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No payment methods saved
                    </h3>
                    <p className="text-gray-500 mb-6">
                      You haven't saved any payment methods yet. Add a payment
                      method to speed up checkout.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
