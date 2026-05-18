"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Search,
  Star,
  GitBranch,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useRepositories } from "@/module/repository/hooks/use-repositories";

interface Repository {
  id: number | string;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  isConnected?: boolean;
}

const RepositorySkeleton = () => {
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="space-y-2">
              <Skeleton className="h-5 w-52" />
              <Skeleton className="h-4 w-full max-w-[500px]" />
              <Skeleton className="h-4 w-[80%]" />
            </div>

            <div className="flex gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>

          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

const RepositoryPage = () => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  const observerRef = useRef<HTMLDivElement | null>(null);

  const [localConnectingId, setLocalConnectingId] = useState<
    number | string | null
  >(null);

  const [searchQuery, setSearchQuery] = useState("");

  const allRepositories = useMemo(
    () =>
      data?.pages.flatMap(
        (page) => page as Repository[]
      ) || [],
    [data]
  );

  const filteredRepositories = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return allRepositories.filter((repo) => {
      return (
        repo.name.toLowerCase().includes(query) ||
        repo.full_name.toLowerCase().includes(query)
      );
    });
  }, [allRepositories, searchQuery]);

  useEffect(() => {
    const observerElement = observerRef.current;

    if (!observerElement) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const first = entries[0];

        if (
          first.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          await fetchNextPage();
        }
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(observerElement);

    return () => {
      observer.disconnect();
    };
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  const handleConnect = async (repo: Repository) => {
    try {
      setLocalConnectingId(repo.id);

      console.log("Connect repository:", repo);

      // TODO:
      // connect repository action
    } catch (error) {
      console.error(error);
    } finally {
      setLocalConnectingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-5 w-80" />
        </div>

        <Skeleton className="h-10 w-full" />

        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <RepositorySkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20 text-red-500">
        Failed to load repositories
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Repositories
        </h1>

        <p className="text-muted-foreground">
          Manage and view all your GitHub repositories
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />

        <Input
          placeholder="Search repositories..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
        />
      </div>

      {/* Repository List */}
      <div className="grid gap-4">
        {filteredRepositories.map((repo) => (
          <Card
            key={repo.id}
            className="transition-all duration-200 hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                {/* Left */}
                <div className="space-y-3 flex-1">
                  <div>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold hover:underline"
                    >
                      {repo.full_name}
                    </a>

                    {repo.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {repo.description}
                      </p>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {repo.language && (
                      <div className="flex items-center gap-1">
                        <GitBranch className="size-4" />
                        {repo.language}
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Star className="size-4" />
                      {repo.stargazers_count}
                    </div>
                  </div>

                  {/* Topics */}
                  {repo.topics?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {repo.topics
                        .slice(0, 5)
                        .map((topic) => (
                          <Badge
                            key={topic}
                            variant="secondary"
                          >
                            {topic}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                  {repo.isConnected ? (
                    <Button
                      disabled
                      variant="secondary"
                    >
                      Connected
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        handleConnect(repo)
                      }
                      disabled={
                        localConnectingId === repo.id
                      }
                    >
                      {localConnectingId === repo.id
                        ? "Connecting..."
                        : "Connect"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Infinite Scroll Skeletons */}
        {isFetchingNextPage &&
          Array.from({ length: 3 }).map((_, i) => (
            <RepositorySkeleton
              key={`skeleton-${i}`}
            />
          ))}
      </div>

      {/* Observer Trigger */}
      <div
        ref={observerRef}
        className="h-10 w-full"
      />

      {/* Empty State */}
      {!isLoading &&
        filteredRepositories.length === 0 && (
          <div className="rounded-lg border border-dashed py-16 text-center">
            <p className="text-muted-foreground">
              No repositories found
            </p>
          </div>
        )}

      {/* No More Repositories */}
      {!hasNextPage &&
        filteredRepositories.length > 0 && (
          <div className="text-center text-sm text-muted-foreground py-4">
            No more repositories
          </div>
        )}
    </div>
  );
};

export default RepositoryPage;