import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";

const newsletterSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export default function NewsletterSection() {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const onSubmit = async (data: NewsletterFormValues) => {
    setIsSubscribing(true);
    try {
      await apiRequest("POST", "/api/newsletter", data);
      toast({
        title: "Thank you for subscribing!",
        description: "You'll now receive updates on new products and upcoming sales",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "There was an error subscribing to the newsletter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };
  
  return (
    <section className="container mx-auto px-6 mb-12">
      <div className="bg-primary rounded-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-2/3 p-8 md:p-12">
            <h2 className="text-white font-poppins text-3xl font-bold mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-white/80 mb-6">
              Get the latest updates on new products and upcoming sales
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input
                          placeholder="Your email address"
                          className="py-3 px-4 rounded-full sm:rounded-r-none mb-2 sm:mb-0 focus:outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-white/90 text-sm mt-1" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit"
                  className="bg-secondary hover:bg-secondary/90 text-white font-medium py-3 px-6 rounded-full sm:rounded-l-none transition-all"
                  disabled={isSubscribing}
                >
                  {isSubscribing ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            </Form>
          </div>
          <div className="hidden md:block md:w-1/3 bg-primary">
            <img 
              src="https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
              alt="Newsletter" 
              className="w-full h-full object-cover opacity-25"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
