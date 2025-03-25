import { useGetAllUsersQuery, useUpdateUserRoleMutation } from "@/features/api/authApi";
import { Loader2, RefreshCw, Search, X, UserCog } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";

export default function Users() {
    const { data, isLoading, error, refetch, isFetching } = useGetAllUsersQuery();
    const [updateUserRole, { isLoading: updatingRole }] = useUpdateUserRoleMutation();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterVerified, setFilterVerified] = useState("all");
    const [filterRole, setFilterRole] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showCoursesDialog, setShowCoursesDialog] = useState(false);
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState("");

    const handleRefresh = () => {
        refetch();
    };

    const handleRoleChange = async () => {
        if (!selectedUser || !selectedRole) return;
        
        try {
            const response = await updateUserRole({
                userId: selectedUser._id,
                role: selectedRole
            }).unwrap();
            
            if (response.success) {
                toast.success(`User role updated to ${selectedRole}`);
                setShowRoleDialog(false);
                refetch();
            }
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error(error.data?.message || "Failed to update role");
        }
    };

    const openRoleDialog = (user) => {
        setSelectedUser(user);
        setSelectedRole(user.role);
        setShowRoleDialog(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading users data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold text-center mb-4">Users Management</h1>
                <div className="text-red-500 text-center">Error loading users data: {error.message}</div>
            </div>
        );
    }

    const allUsers = data?.users || [];
    
    // Apply filters
    const filteredUsers = allUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVerification = filterVerified === "all" ||
                                  (filterVerified === "verified" && user.isVerified) ||
                                  (filterVerified === "pending" && !user.isVerified);
        const matchesRole = filterRole === "all" || user.role === filterRole;
        return matchesSearch && matchesVerification && matchesRole;
    });

    const userCount = filteredUsers.length;

    const handleShowCourses = (user) => {
        setSelectedUser(user);
        setShowCoursesDialog(true);
    };

    // Skeleton loading for table rows
    const TableRowSkeleton = () => (
        <tr className="animate-pulse">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-4"></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="ml-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
            </td>
            <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
            </td>
        </tr>
    );

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Users Management</h1>
                <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold text-gray-600">
                        Total Users: {userCount}
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
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by name or phone number..."
                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <select
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterVerified}
                    onChange={(e) => setFilterVerified(e.target.value)}
                >
                    <option value="all">All Verification</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                </select>
                <select
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="all">All Roles</option>
                    <option value="USER">User</option>
                    <option value="INSTRUCTOR">Instructor</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses Enrolled</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {isFetching ? (
                            // Show skeleton loading while fetching
                            Array(5).fill(0).map((_, index) => <TableRowSkeleton key={index} />)
                        ) : (
                            filteredUsers.map((userItem, index) => (
                                <tr key={userItem._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{index + 1}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                {userItem.photoUrl ? (
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        src={userItem.photoUrl}
                                                        alt={userItem.name}
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-xl text-gray-500">
                                                            {userItem.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{userItem.phone_number || "No phone number"}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            userItem.role === "ADMIN" 
                                                ? "bg-purple-100 text-purple-800" 
                                                : userItem.role === "INSTRUCTOR"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}>
                                            {userItem.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {userItem.enrolledCourses && userItem.enrolledCourses.length > 0 ? (
                                                <div>
                                                    <div className="font-medium">
                                                        {userItem.enrolledCourses[0].courseTitle}
                                                    </div>
                                                    {userItem.enrolledCourses.length > 1 && (
                                                        <button 
                                                            onClick={() => handleShowCourses(userItem)}
                                                            className="text-sm text-blue-600 hover:text-blue-800 mt-1 cursor-pointer"
                                                        >
                                                            +{userItem.enrolledCourses.length - 1} more courses
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">No courses</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            userItem.isVerified 
                                                ? "bg-green-100 text-green-800" 
                                                : "bg-yellow-100 text-yellow-800"
                                        }`}>
                                            {userItem.isVerified ? "Verified" : "Pending"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {userItem.lastLogin 
                                                ? new Date(userItem.lastLogin).toLocaleDateString()
                                                : "Never"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openRoleDialog(userItem)}
                                            className="flex items-center gap-1"
                                        >
                                            <UserCog className="h-4 w-4" />
                                            Manage Role
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Enrolled Courses Dialog */}
            <Dialog open={showCoursesDialog} onOpenChange={setShowCoursesDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Enrolled Courses - {selectedUser?.name}</span>
                            <button
                                onClick={() => setShowCoursesDialog(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="space-y-4">
                            {selectedUser?.enrolledCourses.map((course, index) => (
                                <div key={course._id || index} className="p-4 border rounded-lg hover:bg-gray-50">
                                    <h4 className="font-medium text-gray-900">{course.courseTitle}</h4>
                                    {course.coursePrice !== undefined && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Price: ₹{course.coursePrice}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Change Role Dialog */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Change User Role - {selectedUser?.name}</span>
                            <button
                                onClick={() => setShowRoleDialog(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Role</label>
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRoleDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleRoleChange}
                                    disabled={updatingRole || selectedRole === selectedUser?.role}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {updatingRole ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Role'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 