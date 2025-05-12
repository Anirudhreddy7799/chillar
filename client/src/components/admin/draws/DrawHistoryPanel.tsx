import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Badge } from "../../ui/badge";

interface DrawWinner {
  userId: string;
  name: string;
  prize: number;
  email: string;
}

interface Draw {
  id: string;
  drawDate: string;
  totalPrizePool: number;
  winners: DrawWinner[];
  status: "completed" | "pending" | "failed";
  participantCount: number;
}

export function DrawHistoryPanel() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDrawHistory();
  }, []);

  const loadDrawHistory = async () => {
    try {
      const drawsQuery = query(
        collection(db, "draws"),
        orderBy("drawDate", "desc"),
        limit(50) // Show last 50 draws
      );

      const snapshot = await getDocs(drawsQuery);
      const drawsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Draw[];

      setDraws(drawsData);
    } catch (error) {
      console.error("Error loading draw history:", error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: Draw["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draw History</CardTitle>
        <CardDescription>View past draws and their winners</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : draws.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">
            No draw history available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Prize Pool</TableHead>
                  <TableHead>Winners</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draws.map((draw) => (
                  <TableRow key={draw.id}>
                    <TableCell className="font-medium">
                      {formatDate(draw.drawDate)}
                    </TableCell>
                    <TableCell>{formatCurrency(draw.totalPrizePool)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {draw.winners.map((winner, index) => (
                          <div key={winner.userId} className="text-sm">
                            {winner.name} ({formatCurrency(winner.prize)})
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{draw.participantCount}</TableCell>
                    <TableCell>{getStatusBadge(draw.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
