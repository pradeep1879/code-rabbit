"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getUserProfile,
  updateUserProfille,
} from "../actions";

import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const ProfileForm = () => {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const {
    data: profile,
    isLoading,
  } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => await getUserProfile(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
    }) => {
      return await updateUserProfille(data);
    },

    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({
          queryKey: ["user-profile"],
        });

        toast.success(
          "Profile updated successfully"
        );
      }
    },

    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    updateMutation.mutate({
      name,
      email,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 rounded-2xl border border-border/50 bg-background/60 p-6 backdrop-blur">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>

        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-background/60 p-6 shadow-sm backdrop-blur">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Profile Settings
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Update your personal information.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name
          </Label>

          <Input
            id="name"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            disabled={
              updateMutation.isPending
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address
          </Label>

          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            disabled={
              updateMutation.isPending
            }
          />
        </div>

        <Button
          type="submit"
          disabled={
            updateMutation.isPending
          }
          className="w-full sm:w-auto"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Save Changes
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ProfileForm;