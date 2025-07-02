import { useState } from "react";
import { motion } from "motion/react";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Button } from "@/src/lib/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/lib/components/ui/tabs";
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
      <div className="flex justify-center items-center p-4 min-h-full bg-neo-bg sm:p-6">
        <motion.div
          className="w-full max-w-sm sm:max-w-md lg:max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 sm:p-8 bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg space-y-6 text-center">
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-neo-beige-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Icon name="UserX" className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-800" />
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold tracking-tight uppercase sm:text-3xl text-zinc-900">
                Access Denied
              </h2>
              <p className="text-sm font-medium leading-relaxed sm:text-base text-zinc-600">
                You need to be logged in to view your profile.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                onClick={() => navigate({ to: "/" })}
                variant="neo"
                className="w-full font-bold tracking-wide uppercase border-2 border-black bg-neo-cyan"
                size="lg"
              >
                <div className="flex gap-2 justify-center items-center">
                  <Icon name="ArrowLeft" className="w-5 h-5" />
                  <span>Go Home</span>
                </div>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start p-4 min-h-full bg-neo-bg sm:p-6">
      <motion.div
        className="py-6 space-y-6 w-full max-w-6xl sm:space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight leading-tight uppercase sm:text-5xl lg:text-6xl text-zinc-900">
              Profile
            </h1>
            <p className="mb-8 font-medium text-zinc-600">
              Manage your account settings and preferences
            </p>

            <div className="flex gap-3 justify-center items-center">
              <Button
                variant="neo"
                className={`h-12 rounded-sm px-6 border-2 border-black font-bold uppercase tracking-wide ${isEditing
                    ? "text-red-900 bg-red-200 border-red-600 hover:bg-red-300"
                    : "bg-neo-cyan text-zinc-900 hover:bg-cyan-300"
                  }`}
                onClick={() => setIsEditing(!isEditing)}
              >
                <Icon name={isEditing ? "X" : "Pencil"} className="mr-2 w-4 h-4" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="general" className="space-y-2">
            <div className="flex justify-center">
              <TabsList className="w-screen">
                <TabsTrigger value="general">
                  General
                </TabsTrigger>
                <TabsTrigger value="security">
                  Security
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="general" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl uppercase">
                      Profile Picture
                    </CardTitle>
                    <CardDescription>
                      Upload and manage your profile picture. Supports crop and compression.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfilePicture isEditing={isEditing} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl uppercase">
                      Personal Information
                    </CardTitle>
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
              </motion.div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl uppercase">
                      Wallet Information
                    </CardTitle>
                    <CardDescription>
                      Your connected wallet and authentication details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold tracking-wide uppercase text-zinc-800">
                        Wallet Address
                      </label>
                      <div className="flex items-center space-x-3">
                        <code className="flex-1 px-4 py-3 bg-neo-beige-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-sm text-sm font-mono font-bold text-zinc-900">
                          {user?.wallet?.address || "Not connected"}
                        </code>
                        {user?.wallet?.address && (
                          <Button
                            variant="neo"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(user.wallet?.address || "");
                            }}
                            className="p-0 w-10 h-10 font-bold border-2 border-black bg-neo-indigo"
                          >
                            <Icon name="Copy" className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold tracking-wide uppercase text-zinc-800">
                        Email
                      </label>
                      <div className="px-4 py-3 bg-neo-beige-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-sm text-sm font-bold text-zinc-900">
                        {user?.email?.address || "No email linked"}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold tracking-wide uppercase text-zinc-800">
                        User ID
                      </label>
                      <div className="px-4 py-3 bg-neo-beige-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-sm text-sm font-mono font-bold text-zinc-900">
                        {user?.id || "Unknown"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
} 