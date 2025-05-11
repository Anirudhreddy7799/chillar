import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Search, X, AlertCircle, Filter, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Claim {
  id: number;
  userId: number;
  rewardId: number;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  notes: string;
  submittedAt: string;
  user?: {
    email: string;
  };
  reward?: {
    prizeName: string;
    prizeValue: number;
    imageUrl: string;
  };
}

const ClaimsTable = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>(["pending", "approved", "rejected", "fulfilled"]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  
  useEffect(() => {
    fetchClaims();
  }, []);
  
  useEffect(() => {
    // Apply filters and search
    let result = [...claims];
    
    // Apply status filter
    if (statusFilter.length > 0 && statusFilter.length < 4) {
      result = result.filter(claim => statusFilter.includes(claim.status));
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(claim => 
        claim.user?.email.toLowerCase().includes(query) ||
        claim.reward?.prizeName.toLowerCase().includes(query) ||
        claim.notes?.toLowerCase().includes(query)
      );
    }
    
    setFilteredClaims(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [claims, statusFilter, searchQuery]);
  
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/claims', undefined);
      const data = await response.json();
      setClaims(data);
      setFilteredClaims(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching claims:", err);
      setError("Failed to load claims. Please try again later.");
      
      // Fallback data for development
      const mockClaims = [
        {
          id: 1,
          userId: 2,
          rewardId: 1,
          status: 'pending',
          notes: "Please send voucher to my email",
          submittedAt: "2023-07-23T10:30:00Z",
          user: {
            email: "user2@example.com"
          },
          reward: {
            prizeName: "Amazon Gift Card",
            prizeValue: 500,
            imageUrl: "https://images.unsplash.com/photo-1607083206968-13611e3d76db"
          }
        },
        {
          id: 2,
          userId: 1,
          rewardId: 2,
          status: 'approved',
          notes: "I'd like it for my personal number",
          submittedAt: "2023-07-16T14:45:00Z",
          user: {
            email: "user1@example.com"
          },
          reward: {
            prizeName: "Mobile Recharge",
            prizeValue: 199,
            imageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1"
          }
        },
        {
          id: 3,
          userId: 3,
          rewardId: 3,
          status: 'fulfilled',
          notes: "",
          submittedAt: "2023-07-09T09:15:00Z",
          user: {
            email: "user3@example.com"
          },
          reward: {
            prizeName: "Movie Tickets",
            prizeValue: 300,
            imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728"
          }
        },
        {
          id: 4,
          userId: 4,
          rewardId: 4,
          status: 'rejected',
          notes: "I prefer Swiggy",
          submittedAt: "2023-07-02T11:20:00Z",
          user: {
            email: "user4@example.com"
          },
          reward: {
            prizeName: "Food Delivery Voucher",
            prizeValue: 250,
            imageUrl: "https://images.unsplash.com/photo-1576867757603-05b134ebc379"
          }
        }
      ];
      
      setClaims(mockClaims);
      setFilteredClaims(mockClaims);
      setLoading(false);
    }
  };
  
  const handleViewDetails = (claim: Claim) => {
    setSelectedClaim(claim);
    setDialogOpen(true);
  };
  
  const updateClaimStatus = async (claimId: number, newStatus: 'approved' | 'rejected' | 'fulfilled') => {
    try {
      const response = await apiRequest('PATCH', `/api/claims/${claimId}`, {
        status: newStatus
      });
      
      if (response.ok) {
        // Update local state
        setClaims(prev => 
          prev.map(claim => 
            claim.id === claimId 
              ? { ...claim, status: newStatus } 
              : claim
          )
        );
        
        toast({
          title: `Claim ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
          description: `The claim has been ${newStatus}.`,
          duration: 3000,
        });
        
        // Close dialog if open
        if (dialogOpen && selectedClaim?.id === claimId) {
          setDialogOpen(false);
        }
      } else {
        throw new Error(`Failed to update claim status`);
      }
    } catch (error: any) {
      console.error("Error updating claim status:", error);
      toast({
        title: "Action Failed",
        description: error.message || "Failed to update claim status. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/20 text-warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-success/20 text-success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-error/20 text-error">Rejected</Badge>;
      case 'fulfilled':
        return <Badge variant="outline" className="bg-primary/20 text-primary">Fulfilled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Pagination
  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredClaims.length);
  const currentItems = filteredClaims.slice(startIndex, endIndex);
  
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
        <h2 className="text-xl font-bold text-white">Claims History</h2>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or reward"
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
                checked={statusFilter.includes('pending')}
                onCheckedChange={(checked) => {
                  setStatusFilter(
                    checked
                      ? [...statusFilter, 'pending']
                      : statusFilter.filter((s) => s !== 'pending')
                  );
                }}
              >
                Pending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes('approved')}
                onCheckedChange={(checked) => {
                  setStatusFilter(
                    checked
                      ? [...statusFilter, 'approved']
                      : statusFilter.filter((s) => s !== 'approved')
                  );
                }}
              >
                Approved
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes('rejected')}
                onCheckedChange={(checked) => {
                  setStatusFilter(
                    checked
                      ? [...statusFilter, 'rejected']
                      : statusFilter.filter((s) => s !== 'rejected')
                  );
                }}
              >
                Rejected
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes('fulfilled')}
                onCheckedChange={(checked) => {
                  setStatusFilter(
                    checked
                      ? [...statusFilter, 'fulfilled']
                      : statusFilter.filter((s) => s !== 'fulfilled')
                  );
                }}
              >
                Fulfilled
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button size="sm" variant="outline" onClick={fetchClaims} className="h-10">
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
            <Button onClick={fetchClaims}>Retry</Button>
          </CardContent>
        </Card>
      ) : filteredClaims.length === 0 ? (
        <Card className="bg-card">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No claims found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="bg-card rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3">
                          <span className="text-white font-medium text-sm">
                            {claim.user?.email.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{claim.user?.email || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">ID: {claim.userId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p className="text-sm font-medium text-white">{claim.reward?.prizeName || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {claim.reward ? formatCurrency(claim.reward.prizeValue) : "-"}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(claim.submittedAt)}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {getStatusBadge(claim.status)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex space-x-2">
                        {claim.status === 'pending' && (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              className="p-1 rounded bg-success/20 hover:bg-success/40 transition"
                              onClick={() => updateClaimStatus(claim.id, 'approved')}
                            >
                              <CheckCircle className="text-success h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="p-1 rounded bg-error/20 hover:bg-error/40 transition"
                              onClick={() => updateClaimStatus(claim.id, 'rejected')}
                            >
                              <X className="text-error h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {claim.status === 'approved' && (
                          <Button
                            size="icon"
                            variant="outline"
                            className="p-1 rounded bg-primary/20 hover:bg-primary/40 transition"
                            onClick={() => updateClaimStatus(claim.id, 'fulfilled')}
                          >
                            <Send className="text-primary h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="icon"
                          variant="outline"
                          className="p-1 rounded bg-primary/20 hover:bg-primary/40 transition"
                          onClick={() => handleViewDetails(claim)}
                        >
                          <AlertCircle className="text-primary h-4 w-4" />
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
                Showing {startIndex + 1}-{endIndex} of {filteredClaims.length}
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
      
      {/* Claim Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
            <DialogDescription>
              Detailed information about this claim.
            </DialogDescription>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">User:</span>
                <span className="col-span-3">{selectedClaim.user?.email}</span>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Reward:</span>
                <span className="col-span-3">{selectedClaim.reward?.prizeName}</span>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Value:</span>
                <span className="col-span-3">
                  {selectedClaim.reward ? formatCurrency(selectedClaim.reward.prizeValue) : "-"}
                </span>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Date:</span>
                <span className="col-span-3">{formatDate(selectedClaim.submittedAt)}</span>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Status:</span>
                <span className="col-span-3">{getStatusBadge(selectedClaim.status)}</span>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="text-sm font-medium col-span-1">Notes:</span>
                <span className="col-span-3 whitespace-pre-wrap">
                  {selectedClaim.notes || "No additional notes provided."}
                </span>
              </div>
              
              {selectedClaim.reward?.imageUrl && (
                <div className="mt-2 border-t border-border pt-4">
                  <h4 className="text-sm font-medium mb-2">Reward Image</h4>
                  <div className="h-40 w-full overflow-hidden rounded-md">
                    <img 
                      src={selectedClaim.reward.imageUrl} 
                      alt={selectedClaim.reward.prizeName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2">
            {selectedClaim && selectedClaim.status === 'pending' && (
              <>
                <Button 
                  variant="destructive"
                  onClick={() => updateClaimStatus(selectedClaim.id, 'rejected')}
                >
                  Reject
                </Button>
                <Button 
                  className="bg-success hover:bg-success/90"
                  onClick={() => updateClaimStatus(selectedClaim.id, 'approved')}
                >
                  Approve
                </Button>
              </>
            )}
            
            {selectedClaim && selectedClaim.status === 'approved' && (
              <Button
                onClick={() => updateClaimStatus(selectedClaim.id, 'fulfilled')}
              >
                Mark as Fulfilled
              </Button>
            )}
            
            <Button 
              variant="outline"
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

export default ClaimsTable;
