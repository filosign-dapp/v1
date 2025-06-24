import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { Label } from "@/src/lib/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/lib/components/ui/form";
import { toast } from "sonner";
import Icon from "@/src/lib/components/custom/Icon";

// Form validation schema
const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50, "Display name too long"),
  bio: z.string().max(300, "Bio too long").optional(),
  location: z.string().max(100, "Location too long").optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  isEditing: boolean;
  onSave: () => void;
}

export default function ProfileForm({ isEditing, onSave }: ProfileFormProps) {
  const { user } = usePrivy();
  const [isSaving, setIsSaving] = useState(false);

  // Load saved profile data from localStorage
  const getStoredProfileData = (): Partial<ProfileFormData> => {
    try {
      const stored = localStorage.getItem(`profile_${user?.id}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      location: "",
      website: "",
    },
  });

  // Load stored data on component mount
  useEffect(() => {
    if (user?.id) {
      const storedData = getStoredProfileData();
      form.reset({
        displayName: storedData.displayName || `User ${user.id.slice(0, 8)}`,
        bio: storedData.bio || "",
        location: storedData.location || "",
        website: storedData.website || "",
      });
    }
  }, [user?.id, form]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem(`profile_${user?.id}`, JSON.stringify(data));
      
      toast.success("Profile updated successfully!");
      onSave();
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Profile update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const currentData = getStoredProfileData();

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Display Name
            </Label>
            <div className="px-3 py-2 bg-muted rounded-md text-sm">
              {currentData.displayName || `User ${user?.id?.slice(0, 8)}` || "Not set"}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Location
            </Label>
            <div className="px-3 py-2 bg-muted rounded-md text-sm">
              {currentData.location || "Not set"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Website
          </Label>
          <div className="px-3 py-2 bg-muted rounded-md text-sm">
            {currentData.website ? (
              <a 
                href={currentData.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {currentData.website}
              </a>
            ) : (
              "Not set"
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Bio
          </Label>
          <div className="px-3 py-2 bg-muted rounded-md text-sm min-h-[80px]">
            {currentData.bio || "No bio added yet."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your display name" />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., San Francisco, CA" />
                </FormControl>
                <FormDescription>
                  Your current location (optional).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://your-website.com" type="url" />
              </FormControl>
              <FormDescription>
                Your personal website or portfolio.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Tell us a bit about yourself..."
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormDescription>
                A brief description about yourself (max 300 characters).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Icon name="Loader" className="w-4 h-4 mr-2 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" onClick={onSave}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
} 