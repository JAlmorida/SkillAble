import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CameraIcon,
  ShuffleIcon,
  LoaderIcon,
  School,
} from "lucide-react"; // or your icon library
import {
  useCompleteOnBoardingMutation,
  useGetAuthUserQuery,
} from "@/features/api/authApi";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userLoggedIn } from "@/features/authSlice.js"
import Input from "@/components/ui/input";


const Onboarding = () => {
  const { user, refetch } = useGetAuthUserQuery();
  const authUser = user;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [completeOnBoarding, { isLoading: isPending }] =
    useCompleteOnBoardingMutation();
  const [formState, setFormState] = useState({
    name: authUser?.name || "",
    bio: authUser?.bio || "",
    photoUrl: authUser?.photoUrl || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await completeOnBoarding(formState).unwrap();
      const userProfile = await refetch().unwrap();
      dispatch(userLoggedIn({ user: userProfile.user }));
      navigate("/");
    } catch (error) {
      toast.error(error?.data?.message || "Onboarding failed");
    }
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;
    setFormState({ ...formState, photoUrl: randomAvatar });
    toast.success("Random profile picture generated");
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl text-center">
            Complete Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PROFILE PIC CONTAINER */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {/* IMAGE PREVIEW */}
              <div className="w-32 h-32 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                {formState.photoUrl ? (
                  <img
                    src={formState.photoUrl}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CameraIcon className="w-12 h-12 text-muted-foreground opacity-40" />
                )}
              </div>
              {/* Generate Random Avatar BTN */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleRandomAvatar}
                >
                  <ShuffleIcon className="w-4 h-4 mr-2" />
                  Generate Random Avatar
                </Button>
              </div>
            </div>
            {/* FULL NAME */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={(e) =>
                  setFormState({ ...formState, name: e.target.value })
                }
                placeholder="Your Name here"
              />
            </div>
            {/* BIO */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formState.bio}
                onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                placeholder="Tell others about yourself"
              />
            </div>
            {/* SUBMIT BUTTON */}
            <Button className="w-full" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  <School className="w-5 h-5 mr-2" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <LoaderIcon className="animate-spin w-5 h-5 mr-2" />
                  Onboarding...
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
