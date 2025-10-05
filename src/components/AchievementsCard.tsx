"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Loader2, TrendingUp, Award, Target } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  pointsRequired: number;
  category: string;
}

interface UserAchievement {
  id: number;
  userId: string;
  achievementId: number;
  unlockedAt: string;
  isNew: boolean;
  name: string;
  description: string;
  icon: string;
  pointsRequired: number;
  category: string;
}

interface UserPoints {
  id: number;
  userId: string;
  totalPoints: number;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export default function AchievementsCard() {
  const { data: session } = useSession();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAchievements, setIsCheckingAchievements] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | UserAchievement | null>(null);

  // Fetch user points
  const fetchUserPoints = async () => {
    if (!session?.user?.id) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/gamification/points?user_id=${session.user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        // Create user points record
        await createUserPoints();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user points");
      }

      const data = await response.json();
      setUserPoints(data);
    } catch (error) {
      console.error("Error fetching user points:", error);
    }
  };

  // Create user points record
  const createUserPoints = async () => {
    if (!session?.user?.id) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/gamification/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: session.user.id,
          total_points: 0,
          level: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user points");
      }

      const data = await response.json();
      setUserPoints(data);
    } catch (error) {
      console.error("Error creating user points:", error);
    }
  };

  // Fetch all achievements
  const fetchAllAchievements = async () => {
    try {
      const response = await fetch("/api/gamification/achievements");

      if (!response.ok) {
        throw new Error("Failed to fetch achievements");
      }

      const data = await response.json();
      setAllAchievements(data);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  // Fetch unlocked achievements
  const fetchUnlockedAchievements = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/gamification/achievements/user?user_id=${session.user.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch unlocked achievements");
      }

      const data = await response.json();
      setUnlockedAchievements(data);
    } catch (error) {
      console.error("Error fetching unlocked achievements:", error);
    }
  };

  // Check for new achievements
  const checkAchievements = async () => {
    if (!session?.user?.id) return;

    try {
      setIsCheckingAchievements(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/gamification/achievements/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check achievements");
      }

      const data = await response.json();
      
      if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
        toast.success(`🎉 Achievement Unlocked! You earned ${data.newlyUnlocked.length} new achievement(s)!`);
        await fetchUserPoints();
        await fetchUnlockedAchievements();
      } else {
        toast.info("No new achievements yet. Keep parking!");
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
      toast.error("Failed to check achievements");
    } finally {
      setIsCheckingAchievements(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (session?.user?.id) {
      Promise.all([
        fetchUserPoints(),
        fetchAllAchievements(),
        fetchUnlockedAchievements(),
      ]).finally(() => setIsLoading(false));
    }
  }, [session?.user?.id]);

  if (isLoading) {
    return (
      <Card className="manga-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const unlockedIds = unlockedAchievements.map((ua) => ua.achievementId);
  const lockedAchievements = allAchievements.filter((a) => !unlockedIds.includes(a.id));
  const nextLevelPoints = userPoints ? (userPoints.level * 100) : 100;
  const currentLevelProgress = userPoints ? ((userPoints.totalPoints % 100) / 100) * 100 : 0;

  return (
    <>
      <Card className="manga-border bg-gradient-to-br from-primary/10 to-accent/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-3 rounded-full">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Manga Rewards</CardTitle>
                <CardDescription>Earn points & unlock achievements!</CardDescription>
              </div>
            </div>
            <Button
              onClick={checkAchievements}
              disabled={isCheckingAchievements}
              size="sm"
              className="bg-accent hover:bg-accent/90"
            >
              {isCheckingAchievements ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Star className="mr-2 h-4 w-4" />
                  Check Now
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-lg border-2 border-primary">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-accent" />
                <span className="text-sm font-bold text-muted-foreground">TOTAL POINTS</span>
              </div>
              <div className="text-3xl font-black text-primary">{userPoints?.totalPoints || 0}</div>
            </div>

            <div className="bg-card p-4 rounded-lg border-2 border-primary">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <span className="text-sm font-bold text-muted-foreground">LEVEL</span>
              </div>
              <div className="text-3xl font-black text-primary">{userPoints?.level || 1}</div>
            </div>

            <div className="bg-card p-4 rounded-lg border-2 border-primary">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-accent" />
                <span className="text-sm font-bold text-muted-foreground">UNLOCKED</span>
              </div>
              <div className="text-3xl font-black text-primary">
                {unlockedAchievements.length}/{allAchievements.length}
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">Level {userPoints?.level || 1} Progress</span>
              <span className="text-muted-foreground">
                {userPoints?.totalPoints || 0} / {nextLevelPoints} pts
              </span>
            </div>
            <Progress value={currentLevelProgress} className="h-3" />
          </div>

          {/* Achievements Tabs */}
          <Tabs defaultValue="unlocked" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unlocked">
                Unlocked ({unlockedAchievements.length})
              </TabsTrigger>
              <TabsTrigger value="locked">
                Locked ({lockedAchievements.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unlocked" className="space-y-3 mt-4">
              {unlockedAchievements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No achievements unlocked yet.</p>
                  <p className="text-sm">Start parking to earn your first achievement!</p>
                </div>
              ) : (
                unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    onClick={() => setSelectedAchievement(achievement)}
                    className="flex items-center gap-4 p-4 bg-card border-2 border-primary rounded-lg hover:bg-accent/10 cursor-pointer transition-colors"
                  >
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{achievement.name}</div>
                      <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      <Badge variant="default" className="mt-2">
                        +{achievement.pointsRequired} pts
                      </Badge>
                    </div>
                    {achievement.isNew && (
                      <Badge variant="destructive" className="animate-pulse">
                        NEW!
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="locked" className="space-y-3 mt-4">
              {lockedAchievements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-3 text-accent" />
                  <p className="font-bold text-lg mb-1">🎉 All Achievements Unlocked!</p>
                  <p className="text-sm">You're a parking legend!</p>
                </div>
              ) : (
                lockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    onClick={() => setSelectedAchievement(achievement)}
                    className="flex items-center gap-4 p-4 bg-muted/50 border-2 border-muted rounded-lg opacity-60 hover:opacity-80 cursor-pointer transition-opacity"
                  >
                    <div className="text-4xl grayscale">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{achievement.name}</div>
                      <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      <Badge variant="outline" className="mt-2">
                        <Target className="mr-1 h-3 w-3" />
                        {achievement.pointsRequired} pts required
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Achievement Details Dialog */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="border-2 border-primary">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <span className="text-5xl">{selectedAchievement?.icon}</span>
              {selectedAchievement?.name}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {selectedAchievement?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-bold">Points Value</span>
              <Badge variant="default" className="text-lg px-4 py-1">
                +{selectedAchievement?.pointsRequired} pts
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-bold">Category</span>
              <Badge variant="outline" className="capitalize">
                {selectedAchievement?.category.replace("_", " ")}
              </Badge>
            </div>
            {(selectedAchievement as UserAchievement)?.unlockedAt && (
              <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg border-2 border-accent">
                <span className="font-bold">Unlocked At</span>
                <span className="text-sm">
                  {new Date((selectedAchievement as UserAchievement).unlockedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}