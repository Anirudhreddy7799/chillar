import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Draw } from "@shared/types/lucky-draw";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DrawStats {
  totalDraws: number;
  successfulDraws: number;
  totalPrizePool: number;
  totalWinners: number;
  averagePrizePerWinner: number;
  monthlyTrends: {
    month: string;
    revenue: number;
    prizePool: number;
    winners: number;
  }[];
  winnerDistribution: {
    name: string;
    value: number;
  }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function DrawAnalyticsPanel() {
  const [stats, setStats] = useState<DrawStats>({
    totalDraws: 0,
    successfulDraws: 0,
    totalPrizePool: 0,
    totalWinners: 0,
    averagePrizePerWinner: 0,
    monthlyTrends: [],
    winnerDistribution: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDrawStats();
  }, []);

  const loadDrawStats = async () => {
    try {
      // Get draws from the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const drawsQuery = query(
        collection(db, "draws"),
        where("drawDate", ">=", sixMonthsAgo),
        orderBy("drawDate", "desc")
      );

      const snapshot = await getDocs(drawsQuery);
      const draws = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // Calculate stats
      const totalDraws = draws.length;
      const successfulDraws = draws.filter(
        (d) => d.status === "completed"
      ).length;
      const totalPrizePool = draws.reduce(
        (sum, draw) => sum + draw.totalPrizePool,
        0
      );
      const totalWinners = draws.reduce(
        (sum, draw) => sum + draw.winners.length,
        0
      );

      // Calculate monthly trends
      const monthlyData = draws.reduce(
        (acc, draw) => {
          const month = new Date(draw.drawDate).toLocaleString("default", {
            month: "short",
            year: "2-digit",
          });
          if (!acc[month]) {
            acc[month] = {
              month,
              revenue: 0,
              prizePool: 0,
              winners: 0,
            };
          }
          acc[month].revenue += draw.totalRevenue;
          acc[month].prizePool += draw.totalPrizePool;
          acc[month].winners += draw.winners.length;
          return acc;
        },
        {} as Record<string, any>
      );

      // Calculate winner distribution
      const winnerCounts = draws.reduce(
        (acc, draw) => {
          draw.winners.forEach((winner) => {
            if (!acc[winner.userId]) {
              acc[winner.userId] = {
                name: winner.name,
                value: 0,
              };
            }
            acc[winner.userId].value++;
          });
          return acc;
        },
        {} as Record<string, any>
      );

      setStats({
        totalDraws,
        successfulDraws,
        totalPrizePool,
        totalWinners,
        averagePrizePerWinner: totalWinners ? totalPrizePool / totalWinners : 0,
        monthlyTrends: Object.values(monthlyData),
        winnerDistribution: Object.values(winnerCounts)
          .sort((a, b) => b.value - a.value)
          .slice(0, 5), // Top 5 winners
      });
    } catch (error) {
      console.error("Error loading draw stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Draws</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDraws}</div>
            <p className="text-sm text-muted-foreground">
              {stats.successfulDraws} successful (
              {Math.round((stats.successfulDraws / stats.totalDraws) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Winners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWinners}</div>
            <p className="text-sm text-muted-foreground">
              Avg{" "}
              {stats.totalDraws
                ? Math.round(stats.totalWinners / stats.totalDraws)
                : 0}{" "}
              per draw
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Prize Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalPrizePool)}
            </div>
            <p className="text-sm text-muted-foreground">
              Avg {formatCurrency(stats.averagePrizePerWinner)} per winner
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>
            Prize pool and revenue trends over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="prizePool"
                  stroke="#82ca9d"
                  name="Prize Pool"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Winners Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Winners per Month</CardTitle>
            <CardDescription>
              Distribution of winners across months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="winners"
                    stroke="#8884d8"
                    name="Winners"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Winners</CardTitle>
            <CardDescription>
              Participants who won the most times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.winnerDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => entry.name}
                  >
                    {stats.winnerDistribution.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
