import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetPurchaseRequestsQuery, useUpdatePurchaseStatusMutation, useDeletePurchaseRequestMutation } from '../../features/api/purchaseApi';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { 
  RefreshCw, Search, Share2, Trash2, CheckCircle2, XCircle, 
  Clock, Eye, Phone, Calendar, IndianRupee, Image, ExternalLink,
  MessageSquare, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "@/components/ui/input";

const PurchaseRequests = () => {
  const { data, isLoading, refetch, isFetching } = useGetPurchaseRequestsQuery();
  const [updateStatus] = useUpdatePurchaseStatusMutation();
  const [deleteRequest] = useDeletePurchaseRequestMutation();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ id: null, action: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [processingIds, setProcessingIds] = useState([]);
  const [sortField, setSortField] = useState("requestDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [isReferDialogOpen, setIsReferDialogOpen] = useState(false);
  const [referralEmail, setReferralEmail] = useState("");

  useEffect(() => {
    // Log any errors from the mutation for debugging
    return () => {
      console.log("Component unmounting, clearing any pending requests");
    };
  }, []);

  useEffect(() => {
    // Check how the updateStatus function is defined
    console.log("Update status mutation:", updateStatus);
  }, [updateStatus]);

  const handleRefresh = () => {
    refetch();
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailDialogOpen(true);
  };

  const openConfirmDialog = (requestId, action) => {
    setConfirmAction({ id: requestId, action });
    
    if (action === 'decline') {
      setRejectReason('');
      setIsRejectionDialogOpen(true);
    } else {
      setIsConfirmDialogOpen(true);
    }
  };

  const handleStatusUpdate = async (requestId, status, reason = '') => {
    console.log(`Attempting to update request ${requestId} to status: ${status}`);
    
    try {
      setProcessingIds(prev => [...prev, requestId]);
      
      // Log the request data
      console.log("Request data:", { requestId, status, reason });
      
      // Check if requestId is valid
      if (!requestId) {
        toast.error("Invalid request ID");
        return;
      }
      
      // Pass a single object with both properties
      const result = await updateStatus({
        requestId,
        status,
        reason
      }).unwrap();
      
      console.log("Update successful:", result);
      
      // Simplified notification messaging
      if (status === 'approved') {
        toast.success('Course access approved! Student has been notified.');
      } else if (status === 'declined') {
        toast.success('Request declined. Student has been notified.');
      } else {
        toast.success(`Request ${status} successfully`);
      }
      
      // Close any open dialogs
      setIsConfirmDialogOpen(false);
      setIsRejectionDialogOpen(false);
      setIsDetailDialogOpen(false);
      
      // Force a complete refetch to ensure data is fresh
      await refetch();
    } catch (err) {
      console.error("Status update error:", err);
      
      // Better error handling
      let errorMessage = 'Failed to update request status';
      
      if (err.status === 404) {
        errorMessage = 'Request not found';
      } else if (err.status === 400) {
        errorMessage = err?.data?.message || 'Invalid request data';
      } else if (err.status === 500) {
        errorMessage = 'Server error, please try again later';
      }
      
      toast.error(errorMessage);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleDelete = async (requestId) => {
    try {
      setProcessingIds(prev => [...prev, requestId]);
      await deleteRequest(requestId).unwrap();
      toast.success('Request deleted successfully');
      setIsConfirmDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete request');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const handleRejectSubmit = () => {
    if (confirmAction.id) {
      handleStatusUpdate(confirmAction.id, 'declined', rejectReason);
    }
  };

  const handleContactViaWhatsApp = (phoneNumber) => {
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent(
      "Hello! I'm contacting you regarding your course access request."
    );
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
  };

  const handleRefer = (request) => {
    setSelectedRequest(request);
    setIsReferDialogOpen(true);
  };

  const handleSendReferral = () => {
    // Simulate sending referral
    toast.success(`Referral sent for ${selectedRequest.course?.courseTitle}`);
    setIsReferDialogOpen(false);
    setReferralEmail("");
  };

  // Date filtering function
  const isWithinDateRange = (requestDateStr) => {
    if (dateFilter === 'all') return true;
    
    const requestDate = new Date(requestDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    
    if (dateFilter === 'today') {
      return requestDate >= today;
    } else if (dateFilter === 'yesterday') {
      return requestDate >= yesterday && requestDate < today;
    } else if (dateFilter === 'thisWeek') {
      return requestDate >= thisWeekStart;
    }
    
    return true;
  };

  // Filter and sort requests
  const processedRequests = data?.requests?.filter(request => {
    // Search by student name, phone number, or course title
    const matchesSearch = !searchTerm || 
      (request.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       request.user?.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       request.course?.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    // Filter by date
    const matchesDate = isWithinDateRange(request.createdAt);
    
    return matchesSearch && matchesStatus && matchesDate;
  }) || [];
  
  // Sort the filtered requests
  const sortedRequests = [...processedRequests].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'studentName':
        aValue = a.user?.name || '';
        bValue = b.user?.name || '';
        break;
      case 'courseTitle':
        aValue = a.course?.courseTitle || '';
        bValue = b.course?.courseTitle || '';
        break;
      case 'price':
        aValue = parseFloat(a.course?.coursePrice || 0);
        bValue = parseFloat(b.course?.coursePrice || 0);
        break;
      case 'requestDate':
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Utility function to get status badge styles
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Approved</span>
          </Badge>
        );
      case 'declined':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            <span>Declined</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Skeleton loading for table rows
  const TableRowSkeleton = () => (
    <TableRow className="animate-pulse">
      <TableCell><div className="h-4 bg-gray-200 rounded w-4"></div></TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          <div className="flex flex-col gap-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </TableCell>
      <TableCell><div className="h-4 bg-gray-200 rounded w-16"></div></TableCell>
      <TableCell><div className="h-4 bg-gray-200 rounded w-24"></div></TableCell>
      <TableCell>
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </TableCell>
      <TableCell><div className="h-6 bg-gray-200 rounded w-16"></div></TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </TableCell>
    </TableRow>
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Loading payment requests...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Verification</h1>
          <p className="text-gray-500 mt-1">Manage student course payment requests</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-3xl font-bold">{data?.requests?.length || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Share2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Verification</p>
                <p className="text-3xl font-bold">{data?.requests?.filter(r => r.status === 'pending').length || 0}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-3xl font-bold">{data?.requests?.filter(r => r.status === 'approved').length || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Declined</p>
                <p className="text-3xl font-bold">{data?.requests?.filter(r => r.status === 'declined').length || 0}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, phone or course..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <select
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </select>
        
        <select
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="thisWeek">This Week</option>
        </select>
      </div>

      {/* Results summary */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Showing {sortedRequests.length} of {data.requests.length} requests
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span>Sort by:</span>
          <select 
            className="border rounded px-2 py-1 text-sm"
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortField(field);
              setSortDirection(direction);
            }}
          >
            <option value="requestDate-desc">Newest First</option>
            <option value="requestDate-asc">Oldest First</option>
            <option value="studentName-asc">Student Name (A-Z)</option>
            <option value="studentName-desc">Student Name (Z-A)</option>
            <option value="courseTitle-asc">Course Title (A-Z)</option>
            <option value="courseTitle-desc">Course Title (Z-A)</option>
            <option value="price-desc">Price (High-Low)</option>
            <option value="price-asc">Price (Low-High)</option>
          </select>
        </div>
      </div>

      {!data?.requests?.length ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-700">No Requests Found</h2>
          <p className="mt-2 text-gray-500">There are no payment requests at the moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching ? (
                // Show skeleton loading while refreshing
                Array(5).fill(0).map((_, index) => <TableRowSkeleton key={index} />)
              ) : (
                sortedRequests.map((request, index) => (
                  <TableRow key={request._id || index} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs text-gray-500">
                      {request._id?.slice(-5) || index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-gray-200">
                          <AvatarImage src={request.user?.photoUrl} alt={request.user?.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {request.user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{request.user?.name || 'Unknown'}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="inline-block h-3 w-3 mr-1" />
                            <span>{request.user?.phone_number || 'No phone'}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{request.course?.courseTitle || 'Unknown'}</p>
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">
                        {request.course?.creator?.name ? `by ${request.course.creator.name}` : ''}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-gray-900 font-medium">
                        <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-gray-600" />
                        {request.course?.coursePrice || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-gray-900">{formatDate(request.createdAt).split(',')[0]}</span>
                        <span className="text-xs text-gray-500">{formatDate(request.createdAt).split(',')[1]}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewRequestDetails(request)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => openConfirmDialog(request._id, 'approve')}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              disabled={processingIds.includes(request._id)}
                            >
                              {processingIds.includes(request._id) ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </Button>
                            
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => openConfirmDialog(request._id, 'decline')}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              disabled={processingIds.includes(request._id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Request Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Payment Request Details</DialogTitle>
            <DialogDescription>
              Review payment information and verify student access
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="mt-4 space-y-6">
              <Tabs defaultValue="details">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Request Details</TabsTrigger>
                  <TabsTrigger value="student" className="flex-1">Student Info</TabsTrigger>
                  <TabsTrigger value="course" className="flex-1">Course Info</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Payment Status</h3>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Request ID</h4>
                      <p className="font-mono">{selectedRequest._id}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Request Date</h4>
                      <p>{formatDate(selectedRequest.createdAt)}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Payment Amount</h4>
                      <p className="text-xl font-semibold text-green-700">₹{selectedRequest.course?.coursePrice || 0}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h4>
                      <p>UPI / Direct Bank Transfer</p>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-amber-800">Payment Verification Required</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Please verify that the student has sent the payment screenshot via WhatsApp before approving.
                          Check that the amount matches the course price shown above.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">Payment Timeline</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                          <Share2 className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Request submitted</p>
                          <p className="text-xs text-gray-500">{formatDate(selectedRequest.createdAt)}</p>
                        </div>
                      </div>
                      
                      {selectedRequest.status === 'pending' && (
                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center mt-0.5 mr-3">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Awaiting verification</p>
                            <p className="text-xs text-gray-500">Payment is pending verification</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedRequest.status === 'approved' && (
                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Payment approved</p>
                            <p className="text-xs text-gray-500">{formatDate(selectedRequest.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedRequest.status === 'declined' && (
                        <div className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5 mr-3">
                            <XCircle className="h-3.5 w-3.5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Payment declined</p>
                            <p className="text-xs text-gray-500">{formatDate(selectedRequest.updatedAt)}</p>
                            {selectedRequest.reason && (
                              <p className="text-xs text-red-600 mt-1">Reason: {selectedRequest.reason}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="student" className="mt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border border-gray-200">
                      <AvatarImage src={selectedRequest.user?.photoUrl} alt={selectedRequest.user?.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                        {selectedRequest.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedRequest.user?.name}</h3>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Phone className="h-4 w-4 mr-1" />
                        <span>{selectedRequest.user?.phone_number || 'No phone number'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                      <p>{selectedRequest.user?.email || 'No email'}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">User ID</h4>
                      <p className="font-mono text-sm">{selectedRequest.user?._id || 'Unknown'}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Account Created</h4>
                      <p>{selectedRequest.user?.createdAt ? formatDate(selectedRequest.user.createdAt) : 'Unknown'}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Contact Student</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleContactViaWhatsApp(selectedRequest.user?.phone_number)}
                        className="mt-1 w-full"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                        </svg>
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="course" className="mt-4 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/3">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        {selectedRequest.course?.courseThumbnail ? (
                          <img 
                            src={selectedRequest.course.courseThumbnail} 
                            alt={selectedRequest.course.courseTitle} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="md:w-2/3">
                      <h3 className="text-xl font-semibold text-gray-900">{selectedRequest.course?.courseTitle}</h3>
                      <p className="text-gray-500 mt-1">
                        by {selectedRequest.course?.creator?.name || 'Unknown Creator'}
                      </p>
                      
                      <div className="flex items-center mt-3">
                        <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                          {selectedRequest.course?.category || 'Uncategorized'}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                          {selectedRequest.course?.courseLevel || 'All Levels'}
                        </Badge>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-semibold text-xl text-green-700">₹{selectedRequest.course?.coursePrice || 0}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Lectures</p>
                          <p className="font-semibold">{selectedRequest.course?.lectures?.length || 0} lectures</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Course Description</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div dangerouslySetInnerHTML={{ __html: selectedRequest.course?.description || 'No description available' }} className="prose prose-sm max-w-none" />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(`/course-detail/${selectedRequest.course?._id}`, '_blank')}
                      className="flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Course Details
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              
              {selectedRequest.status === 'pending' && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsDetailDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          setIsDetailDialogOpen(false);
                          openConfirmDialog(selectedRequest._id, 'decline');
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline Access
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsDetailDialogOpen(false);
                          openConfirmDialog(selectedRequest._id, 'approve');
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve Access
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction.action === 'approve' ? 'Approve Access' : 
               confirmAction.action === 'decline' ? 'Decline Access' : 
               'Confirm Action'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction.action === 'approve' 
                ? 'Are you sure you want to approve access? This will grant the student immediate access to the course content.'
                : confirmAction.action === 'decline'
                ? 'Are you sure you want to decline access? The student will need to submit a new payment request.'
                : 'Are you sure you want to proceed with this action?'}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant={confirmAction.action === 'approve' ? 'default' : 'destructive'}
              onClick={() => {
                if (confirmAction.action === 'approve') {
                  handleStatusUpdate(confirmAction.id, 'approved');
                } else if (confirmAction.action === 'decline') {
                  setIsConfirmDialogOpen(false);
                  setIsRejectionDialogOpen(true);
                } else if (confirmAction.action === 'delete') {
                  handleDelete(confirmAction.id);
                }
              }}
            >
              {confirmAction.action === 'approve' ? 'Approve' : 
               confirmAction.action === 'decline' ? 'Decline' : 
               confirmAction.action === 'delete' ? 'Delete' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rejection Reason Dialog */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Rejection Reason</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this payment request. 
              This will help the student understand why their access was not granted.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="rejectReason" className="text-sm font-medium">Rejection Reason</label>
              <textarea
                id="rejectReason"
                className="w-full min-h-[100px] p-3 border rounded-md"
                placeholder="e.g., Payment screenshot not received, Amount mismatch, etc."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRejectionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim()}
            >
              Decline Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseRequests; 