import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { Draw } from "@shared/types/lucky-draw";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";

export function DrawHistoryPanel() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentDraws();
  }, []);

  const loadRecentDraws = async () => {
    try {
      const drawsQuery = query(
        collection(db, "draws"),
        orderBy("drawDate", "desc"),
        limit(10)
      );

      const snapshot = await getDocs(drawsQuery);
      const drawsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Draw[];

      setDraws(drawsData);
    } catch (error) {
      console.error("Error loading draws:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Draws</CardTitle>
        <CardDescription>
          Last 10 weekly draws and their winners
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Draw Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Winners</TableHead>
              <TableHead>Prize Pool</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {draws.map((draw) => (
              <TableRow key={draw.id}>
                <TableCell>{draw.drawDate.toLocaleDateString()}</TableCell>
                <TableCell>{getStatusBadge(draw.status)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {draw.winners.map((winner, index) => (
                      <div key={winner.uid} className="text-sm">
                        {winner.email}: {formatCurrency(winner.prizeAmount)}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(draw.totalPrizePool)}</TableCell>
                <TableCell>{formatCurrency(draw.totalRevenue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
