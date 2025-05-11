import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Info, Send, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
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
  notes: string;
  status: string;
  submittedAt: string;
  user?: {
    email: string;
    id: number;
  };
  reward?: {
    prizeName: string;
    prizeValue: number;
    imageUrl: string;
  };
}

const PendingClaims = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string[]>(["pending", "approved"]);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchClaims();
  }, []);
  
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', '/api/claims/pending', undefined);
      const data = await response.json();
      setClaims(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching claims:", err);
      setError("Failed to load claims data. Please try again later.");
      
      // Fallback data for development
      setClaims([
        {
          id: 1,
          userId: 285931,
          rewardId: 101,
          notes: "Please send the voucher to my account email.",
          status: "pending",
          submittedAt: "2023-07-23T10:00:00Z",
          user: { 
            email: "r****@outlook.com",
            id: 285931
          },
          reward: { 
            prizeName: "₹500 Amazon Voucher",
            prizeValue: 500,
            imageUrl: "https://images.unsplash.com/photo-1607083206968-13611e3d76db"
          }
        },
        {
          id: 2,
          userId: 182756,
          rewardId: 102,
          notes: "I would like the recharge on my personal number.",
          status: "pending",
          submittedAt: "2023-07-16T14:30:00Z",
          user: { 
            email: "s****@gmail.com",
            id: 182756
          },
          reward: { 
            prizeName: "₹199 Mobile Recharge",
            prizeValue: 199,
            imageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1"
          }
        },
        {
          id: 3,
          userId: 392104,
          rewardId: 103,
          notes: "I would prefer Swiggy credits if available.",
          status: "approved",
          submittedAt: "2023-07-09T09:15:00Z",
          user: { 
            email: "p****@yahoo.com",
            id: 392104
          },
          reward: { 
            prizeName: "₹250 Food Delivery",
            prizeValue: 250,
            imageUrl: "https://images.unsplash.com/photo-1576867757603-05b134ebc379"
          }
        }
      ]);
      setLoading(false);
    }
  };
  
  const handleClaimAction = async (claimId: number, action: 'approve' | 'reject' | 'fulfill' | 'view') => {
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;
    
    if (action === 'view') {
      setSelectedClaim(claim);
      setDialogOpen(true);
      return;
    }
    
    try {
      const newStatus = 
        action === 'approve' ? 'approved' : 
        action === 'reject' ? 'rejected' : 
        'fulfilled';
      
      await apiRequest('PATCH', `/api/claims/${claimId}`, {
        status: newStatus
      });
      
      toast({
        title: `Claim ${action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Fulfilled'}`,
        description: `The claim has been ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked as fulfilled'}.`,
        duration: 3000,
      });
      
      // Optimistically update UI
      setClaims(prev => 
        prev.map(c => 
          c.id === claimId 
            ? { ...c, status: newStatus } 
            : c
        )
      );
    } catch (error) {
      console.error(`Error ${action}ing claim:`, error);
      toast({
        title: "Action Failed",
        description: `Failed to ${action} the claim. Please try again.`,
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
  
  const filteredClaims = claims.filter(claim => filterStatus.includes(claim.status));
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Pending Claims</h2>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={filterStatus.includes('pending')}
                onCheckedChange={(checked) => {
                  setFilterStatus(
                    checked
                      ? [...filterStatus, 'pending']
                      : filterStatus.filter((s) => s !== 'pending')
                  );
                }}
              >
                Pending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatus.includes('approved')}
                onCheckedChange={(checked) => {
                  setFilterStatus(
                    checked
                      ? [...filterStatus, 'approved']
                      : filterStatus.filter((s) => s !== 'approved')
                  );
                }}
              >
                Approved
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatus.includes('rejected')}
                onCheckedChange={(checked) => {
                  setFilterStatus(
                    checked
                      ? [...filterStatus, 'rejected']
                      : filterStatus.filter((s) => s !== 'rejected')
                  );
                }}
              >
                Rejected
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterStatus.includes('fulfilled')}
                onCheckedChange={(checked) => {
                  setFilterStatus(
                    checked
                      ? [...filterStatus, 'fulfilled']
                      : filterStatus.filter((s) => s !== 'fulfilled')
                  );
                }}
              >
                Fulfilled
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button size="sm" variant="outline" onClick={fetchClaims} className="h-8">
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
            <p className="text-muted-foreground">No claims found matching your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-card rounded-lg p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3">
                          <span className="text-white font-medium text-sm">
                            {claim.user?.email.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{claim.user?.email || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">User ID: {claim.userId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p className="text-sm text-white">{claim.reward?.prizeName || 'Unknown'}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p className="text-sm text-muted-foreground">
                        {new Date(claim.submittedAt).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
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
                              onClick={() => handleClaimAction(claim.id, 'approve')}
                            >
                              <Check className="text-success h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon"
                              variant="outline"
                              className="p-1 rounded bg-error/20 hover:bg-error/40 transition"
                              onClick={() => handleClaimAction(claim.id, 'reject')}
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
                            onClick={() => handleClaimAction(claim.id, 'fulfill')}
                          >
                            <Send className="text-primary h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          size="icon"
                          variant="outline"
                          className="p-1 rounded bg-primary/20 hover:bg-primary/40 transition"
                          onClick={() => handleClaimAction(claim.id, 'view')}
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
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
            <DialogDescription>
              Review the details of this claim.
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
                <span className="col-span-3">₹{selectedClaim.reward?.prizeValue}</span>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Status:</span>
                <span className="col-span-3">{getStatusBadge(selectedClaim.status)}</span>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-sm font-medium col-span-1">Date:</span>
                <span className="col-span-3">
                  {new Date(selectedClaim.submittedAt).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="text-sm font-medium col-span-1">Notes:</span>
                <span className="col-span-3 whitespace-pre-wrap">
                  {selectedClaim.notes || "No additional notes provided."}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            {selectedClaim && selectedClaim.status === 'pending' && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleClaimAction(selectedClaim.id, 'reject');
                    setDialogOpen(false);
                  }}
                >
                  Reject
                </Button>
                <Button 
                  className="bg-success hover:bg-success/90"
                  onClick={() => {
                    handleClaimAction(selectedClaim.id, 'approve');
                    setDialogOpen(false);
                  }}
                >
                  Approve
                </Button>
              </>
            )}
            
            {selectedClaim && selectedClaim.status === 'approved' && (
              <Button 
                onClick={() => {
                  handleClaimAction(selectedClaim.id, 'fulfill');
                  setDialogOpen(false);
                }}
              >
                Mark as Fulfilled
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingClaims;
