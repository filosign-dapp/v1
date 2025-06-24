import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Button } from "@/src/lib/components/ui/button";
import { Separator } from "@/src/lib/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/lib/components/ui/tabs";
import Navbar from "@/src/lib/components/app/Navbar";
import ProfileForm from "./components/ProfileForm";
import ProfilePicture from "./components/ProfilePicture";
import Icon from "@/src/lib/components/custom/Icon";
import { useNavigate } from "@tanstack/react-router";

export default function Profile() {
  const { user, authenticated } = usePrivy();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  if (!authenticated) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <Icon name="UserX" className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-4">
                  You need to be logged in to view your profile.
                </p>
                <Button onClick={() => navigate({ to: "/" })}>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full px-8">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences.
              </p>
            </div>
            <Button
              variant={isEditing ? "secondary" : "default"}
              onClick={() => setIsEditing(!isEditing)}
            >
              <Icon name={isEditing ? "X" : "Pencil"} className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  Upload and manage your profile picture. Supports crop and compression.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfilePicture isEditing={isEditing} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and display preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm
                  isEditing={isEditing}
                  onSave={() => setIsEditing(false)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Information</CardTitle>
                <CardDescription>
                  Your connected wallet and authentication details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Wallet Address
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
                      {user?.wallet?.address || "Not connected"}
                    </code>
                    {user?.wallet?.address && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(user.wallet?.address || "");
                        }}
                      >
                        <Icon name="Copy" className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    {user?.email?.address || "No email linked"}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    User ID
                  </label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono">
                    {user?.id || "Unknown"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 