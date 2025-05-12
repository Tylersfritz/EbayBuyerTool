
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const profileFormSchema = z.object({
  first_name: z.string().min(1, {
    message: "First name is required",
  }),
  last_name: z.string().min(1, {
    message: "Last name is required",
  }),
  email: z.string().email().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfilePage = () => {
  const { profile, subscription, updateProfile, isPremium } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      email: profile?.email || "",
    },
    mode: "onChange",
  });
  
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { error: updateError } = await updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
      });
      
      if (updateError) {
        setError(updateError.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account details and subscription</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your account information</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input disabled placeholder="Your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Information about your current subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Plan</p>
                  <p className="text-muted-foreground">
                    {subscription?.subscription_tier === 'premium' ? 'Premium' : 'Free'}
                  </p>
                </div>
                <Badge 
                  variant={isPremium ? "default" : "outline"}
                  className={isPremium ? "bg-green-600" : ""}
                >
                  {isPremium ? (
                    <span className="flex items-center">
                      <BadgeCheck className="mr-1 h-3 w-3" />
                      Active
                    </span>
                  ) : "Inactive"}
                </Badge>
              </div>
              
              {isPremium && subscription?.subscription_start && (
                <div>
                  <p className="font-medium">Started On</p>
                  <p className="text-muted-foreground">
                    {format(new Date(subscription.subscription_start), 'PPP')}
                  </p>
                </div>
              )}
              
              {isPremium && subscription?.subscription_end && (
                <div>
                  <p className="font-medium">Renews On</p>
                  <p className="text-muted-foreground">
                    {format(new Date(subscription.subscription_end), 'PPP')}
                  </p>
                </div>
              )}
              
              {!isPremium && (
                <div className="rounded-md bg-primary/10 p-4">
                  <h4 className="font-semibold mb-2">Upgrade to Premium</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get access to premium features, including auction sniping, arbitrage search,
                    and more.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Upgrade Now
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          {isPremium && (
            <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Need to cancel or change your plan?
              </p>
              <Button variant="outline" size="sm">
                Manage Subscription
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
