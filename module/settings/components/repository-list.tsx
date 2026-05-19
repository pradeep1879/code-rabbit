"use client";

import React, { useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getConnectedRepositories,
  diconnectedRepository,
  diconnectAllRepositories,
} from "../actions";

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import {
  Trash2,
  Loader2,
  FolderGit2,
  GitBranchIcon,
} from "lucide-react";

const RepositoryList = () => {
  const queryClient = useQueryClient();

  const [diconnectedAllOpen, setDiconnectedAllOpen] =
    useState(false);

  const {
    data: repositories = [],
    isLoading,
  } = useQuery({
    queryKey: ["connected-repositories"],
    queryFn: async () =>
      await getConnectedRepositories(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await diconnectedRepository(id);
    },

    onSuccess: () => {
      toast.success(
        "Repository disconnected"
      );

      queryClient.invalidateQueries({
        queryKey: [
          "connected-repositories",
        ],
      });
    },

    onError: () => {
      toast.error(
        "Failed to disconnect repository"
      );
    },
  });

  const disconnectAllMutation =
    useMutation({
      mutationFn: async () => {
        return await diconnectAllRepositories();
      },

      onSuccess: () => {
        toast.success(
          "All repositories disconnected"
        );

        queryClient.invalidateQueries({
          queryKey: [
            "connected-repositories",
          ],
        });

        setDiconnectedAllOpen(false);
      },

      onError: () => {
        toast.error(
          "Failed to disconnect repositories"
        );
      },
    });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map(
          (_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border/50 bg-background/60 p-5 backdrop-blur"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-72" />
                </div>

                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          )
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-background/60 p-6 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Connected Repositories
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage repositories connected to
            your workspace.
          </p>
        </div>

        {repositories?.length > 0 && (
          <AlertDialog
            open={diconnectedAllOpen}
            onOpenChange={
              setDiconnectedAllOpen
            }
          >
            <AlertDialogTrigger >
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <Trash2 className="mr-2 size-4" />
                Disconnect All
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Disconnect all repositories?
                </AlertDialogTitle>

                <AlertDialogDescription>
                  This action cannot be
                  undone. All connected
                  repositories will be
                  removed from your account.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={() =>
                    disconnectAllMutation.mutate()
                  }
                  disabled={
                    disconnectAllMutation.isPending
                  }
                >
                  {disconnectAllMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    "Disconnect All"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {!repositories ||
      repositories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-background/40 px-6 py-14 text-center">
          <FolderGit2 className="mb-4 size-12 text-muted-foreground" />

          <h3 className="text-lg font-semibold">
            No repositories connected
          </h3>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Connect your GitHub repositories
            to start analyzing pull requests
            and reviewing code quality.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {repositories.map(
            (repository: any) => (
              <div
                key={repository.id}
                className="rounded-2xl border border-border/50 bg-background/60 p-5 shadow-sm transition-colors hover:border-border backdrop-blur"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <GitBranchIcon className="size-5 shrink-0" />

                      <h3 className="truncate text-lg font-semibold">
                        {
                          repository.fullName
                        }
                      </h3>

                      <Badge
                        variant="secondary"
                      >
                        Connected
                      </Badge>
                    </div>

                    <a
                      href={repository.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block truncate text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {repository.url}
                    </a>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger
                    >
                      <Button
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Disconnect
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Disconnect repository?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                          This will remove
                          the repository from
                          your connected
                          repositories list.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                          onClick={() =>
                            disconnectMutation.mutate(
                              repository.id
                            )
                          }
                          disabled={
                            disconnectMutation.isPending
                          }
                        >
                          {disconnectMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 size-4 animate-spin" />
                              Disconnecting...
                            </>
                          ) : (
                            "Disconnect"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default RepositoryList;