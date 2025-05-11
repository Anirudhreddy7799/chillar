import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info, Search, UserCheck, UserX, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Subscriber {
  id: number;
  email: string;
  isAdmin: boolean;
  isSubscribed: boolean;
  referralCode: string;
  createdAt: string;
  subscription?: {
    id: number;
    startDate: string;
    endDate: string;
    status: string;
  };
}

const SubscribersTable = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>(["active", "inactive"]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  useEffect(() => {
    fetchSubscribers();
  }, []);
  
  useEffect(() => {
    // Apply filters and search
    let result = [...subscribers];
    
    // Apply status filter
    if (statusFilter.length > 0 && statusFilter.length < 2) {
      const isActive = statusFilter.includes("active");
      result = result.filter(sub => sub.isSubscribed === isActive);
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(sub => 
        sub.email.toLowerCase().includes(query) ||
        sub.referralCode.toLowerCase().includes(query)
      );
    }
    
    setFilteredSubscribers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [subscribers, statusFilter, searchQuery]);
  
  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/users', undefined);
      const data = await response.json();
      setSubscribers(data);
      setFilteredSubscribers(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      setError("Failed to load subscribers. Please try again later.");
      
      // Fallback data for development
      const mockSubscribers = [
        {
          id: 1,
          email: "user1@example.com",
          isAdmin: false,
          isSubscribed: true,
          referralCode: "USER123",
          createdAt: "2023-06-15T10:30:00Z",
          subscription: {
            id: 101,
            startDate: "2023-06-15T10:30:00Z",
            endDate: "2023-07-15T10:30:00Z",
            status: "active",
          }
        },
        {
          id: 2,
          email: "user2@example.com",
          isAdmin: false,
          isSubscribed: true,
          referralCode: "USER456",
          createdAt: "2023-06-20T14:15:00Z",
          subscription: {
            id: 102,
            startDate: "2023-06-20T14:15:00Z",
            endDate: "2023-07-20T14:15:00Z",
            status: "active",
          }
        },
        {
          id: 3,
          email: "user3@example.com",
          isAdmin: false,
          isSubscribed: false,
          referralCode: "USER789",
          createdAt: "2023-06-25T09:45:00Z",
        },
        {
          id: 4,
          email: "admin@chillarclub.in",
          isAdmin: true,
          isSubscribed: true,
          referralCode: "ADMIN123",
          createdAt: "2023-06-01T00:00:00Z",
          subscription: {
            id: 103,
            startDate: "2023-06-01T00:00:00Z",
            endDate: "2023-07-01T00:00:00Z",
            status: "active",
          }
        }
      ];
      
      setSubscribers(mockSubscribers);
      setFilteredSubscribers(mockSubscribers);
      setLoading(false);
    }
  };
  
  const handleViewDetails = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setDialogOpen(true);
  };
  
  const updateSubscriptionStatus = async (subscriberId: number, newStatus: boolean) => {
    try {
      const response = await apiRequest('PATCH', `/api/users/${subscriberId}`, {
        isSubscribed: newStatus,
      });
      
      if (response.ok) {
        // Update local state
        setSubscribers(prev => 
          prev.map(sub => 
            sub.id === subscriberId 
              ? { ...sub, isSubscribed: newStatus } 
              : sub
          )
        );
        
        toast({
          title: `Subscription ${newStatus ? 'Activated' : 'Deactivated'}`,
          description: `User subscription has been ${newStatus ? 'activated' : 'deactivated'}.`,
          duration: 3000,
        });
      } else {
        throw new Error(`Failed to update subscription status`);
      }
    } catch (error: any) {
      console.error("Error updating subscription status:", error);
      toast({
        title: "Action Failed",
        description: error.message || "Failed to update subscription status. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  // Pagination
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredSubscribers.length);
  const currentItems = filteredSubscribers.slice(startIndex, endIndex);
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">Subscribers</h2>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or referral code"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full sm:w-64"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes('active')}
                onCheckedChange={(checked) => {
                  setStatusFilter(
                    checked
                      ? [...statusFilter, 'active']
                      : statusFilter.filter((s) => s !== 'active')
                  );
                }}
              >
                Active Subscribers
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes('inactive')}
                onCheckedChange={(checked) => {
                  setStatusFilter(
                    checked
                      ? [...statusFilter, 'inactive']
                      : statusFilter.filter((s) => s !== 'inactive')
                  );
                }}
              >
                Inactive Subscribers
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button size="sm" variant="outline" onClick={fetchSubscribers} className="h-10">
            Refresh
          </Button>
        </div>
      </div>
      
      {loading ? (
        <Card className="bg-card animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="bg-card">
          <CardContent className="p-6 text-center">
            <p className="text-error mb-4">{error}</p>
            <Button onClick={fetchSubscribers}>Retry</Button>
          </CardContent>
        </Card>
      ) : filteredSubscribers.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No subscribers found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="bg-card rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3">
                          <span className="text-white font-medium text-sm">
                            {subscriber.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{subscriber.email}</p>
                          {subscriber.isAdmin && (
                            <Badge variant="outline" className="bg-primary/20 text-primary mt-1">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p className="text-sm font-medium text-white">{subscriber.referralCode}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(subscriber.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {subscriber.isSubscribed ? (
                        <Badge variant="outline" className="bg-success/20 text-success">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex space-x-2">
                        {subscriber.isSubscribed ? (
                          <Button
                            size="icon"
                            variant="outline"
                            className="p-1 rounded bg-error/20 hover:bg-error/40 transition"
                            onClick={() => updateSubscriptionStatus(subscriber.id, false)}
                          >
                            <UserX className="text-error h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="outline"
                            className="p-1 rounded bg-success/20 hover:bg-success/40 transition"
                            onClick={() => updateSubscriptionStatus(subscriber.id, true)}
                          >
                            <UserCheck className="text-success h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="outline"
                          className="p-1 rounded bg-primary/20 hover:bg-primary/40 transition"
                          onClick={() => handleViewDetails(subscriber)}
                        >
                          <Info className="text-primary h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <div className="text-muted-foreground">
                Showing {startIndex + 1}-{endIndex} of {filteredSubscribers.length}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Subscriber Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Subscriber Details</DialogTitle>
            <DialogDescription>
              Detailed information about this subscriber.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubscriber && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Email:</span>
                <span className="col-span-3">{selectedSubscriber.email}</span>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Referral Code:</span>
                <span className="col-span-3">{selectedSubscriber.referralCode}</span>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Joined:</span>
                <span className="col-span-3">{formatDate(selectedSubscriber.createdAt)}</span>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Status:</span>
                <span className="col-span-3">
                  {selectedSubscriber.isSubscribed ? (
                    <Badge variant="outline" className="bg-success/20 text-success">
                      Active Subscriber
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      Inactive
                    </Badge>
                  )}
                </span>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">User Type:</span>
                <span className="col-span-3">
                  {selectedSubscriber.isAdmin ? (
                    <Badge variant="outline" className="bg-primary/20 text-primary">
                      Admin
                    </Badge>
                  ) : (
                    "Regular User"
                  )}
                </span>
              </div>
              
              {selectedSubscriber.subscription && (
                <>
                  <div className="border-t border-border pt-4 mt-2">
                    <h4 className="text-sm font-medium mb-2">Subscription Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium col-span-1">Start Date:</span>
                    <span className="col-span-3">{formatDate(selectedSubscriber.subscription.startDate)}</span>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium col-span-1">End Date:</span>
                    <span className="col-span-3">{formatDate(selectedSubscriber.subscription.endDate)}</span>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium col-span-1">Status:</span>
                    <span className="col-span-3">
                      <Badge variant="outline" className={
                        selectedSubscriber.subscription.status === "active" 
                          ? "bg-success/20 text-success"
                          : "bg-error/20 text-error"
                      }>
                        {selectedSubscriber.subscription.status.charAt(0).toUpperCase() + 
                        selectedSubscriber.subscription.status.slice(1)}
                      </Badge>
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => setDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscribersTable;
