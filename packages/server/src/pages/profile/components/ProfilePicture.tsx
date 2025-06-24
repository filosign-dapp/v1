import { useState, useRef, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/lib/components/ui/avatar";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { toast } from "sonner";
import Icon from "@/src/lib/components/custom/Icon";
import Crop from "@/src/lib/components/custom/Crop";

interface ProfilePictureProps {
  isEditing: boolean;
}

export default function ProfilePicture({ isEditing }: ProfilePictureProps) {
  const { user } = usePrivy();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved profile image from localStorage
  const getStoredProfileImage = (): string | null => {
    try {
      return localStorage.getItem(`profile_image_${user?.id}`) || null;
    } catch {
      return null;
    }
  };

  // Initialize profile image from storage
  useState(() => {
    if (user?.id) {
      const stored = getStoredProfileImage();
      if (stored) {
        setProfileImage(stored);
      }
    }
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file too large. Please select a file under 10MB.");
      return;
    }

    setSelectedFile(file);
    setIsCropOpen(true);
  }, []);

  const handleCrop = useCallback(async (croppedFile: File) => {
    setIsUploading(true);
    
    try {
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        
        // Save to localStorage (in a real app, this would upload to your server)
        localStorage.setItem(`profile_image_${user?.id}`, base64);
        setProfileImage(base64);
        
        toast.success("Profile picture updated successfully!");
        setIsCropOpen(false);
        setSelectedFile(null);
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      
      reader.onerror = () => {
        throw new Error("Failed to process image");
      };
      
      reader.readAsDataURL(croppedFile);
    } catch (error) {
      toast.error("Failed to update profile picture. Please try again.");
      console.error("Profile picture update error:", error);
    } finally {
      setIsUploading(false);
    }
  }, [user?.id]);

  const handleRemove = useCallback(() => {
    if (!user?.id) return;
    
    localStorage.removeItem(`profile_image_${user.id}`);
    setProfileImage(null);
    toast.success("Profile picture removed.");
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [user?.id]);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const currentImage = profileImage || getStoredProfileImage();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src={currentImage || undefined} />
          <AvatarFallback className="text-2xl">
            {user?.wallet?.address?.slice(0, 1)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        {isEditing && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button onClick={triggerFileSelect} disabled={isUploading}>
                <Icon name="Upload" className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
              
              {currentImage && (
                <Button variant="outline" onClick={handleRemove}>
                  <Icon name="Trash2" className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              JPG, PNG or GIF. Max size 10MB.
            </p>
          </div>
        )}

        {!isEditing && !currentImage && (
          <div className="text-sm text-muted-foreground">
            No profile picture set.
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Crop modal */}
      {selectedFile && (
        <Crop
          isOpen={isCropOpen}
          onClose={() => {
            setIsCropOpen(false);
            setSelectedFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          image={selectedFile}
          onCrop={handleCrop}
          initialAspectRatio="square"
          allowedAspectRatios={["square"]}
        />
      )}
    </div>
  );
} 