import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useGetPendingRequestsCountQuery } from "@/features/api/purchaseApi";
import { Badge } from "@/components/ui/badge";
import CourseApprovalNotification from "@/components/CourseApprovalNotification";

const AdminLayout = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { data: pendingCount, isSuccess } = useGetPendingRequestsCountQuery();

  const isActive = (path) => {
    // For exact matches
    if (location.pathname === path) return true;
    
    // For purchase-requests checking both exact path and the redirect from allow-access
    if (path === "/admin/purchase-requests" && location.pathname.includes("purchase-requests")) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <CourseApprovalNotification />
      <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="bg-white text-blue-800 hover:bg-blue-50">
            Welcome, {user.name}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex gap-4 border-b">
          <Link to="/admin/course">
            <Button
              variant={isActive("/admin/course") ? "default" : "ghost"}
              className="relative"
            >
              Courses
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button
              variant={isActive("/admin/users") ? "default" : "ghost"}
              className="relative"
            >
              Users
            </Button>
          </Link>
          <Link to="/admin/purchase-requests">
            <Button
              variant={isActive("/admin/purchase-requests") ? "default" : "ghost"}
              className="relative"
            >
              Access Requests
              {isSuccess && pendingCount > 0 && (
                <Badge 
                  className="bg-red-500 text-white h-3 w-3 flex items-center justify-center rounded-full text-[9px] ml-1"
                  variant="destructive"
                >
                  {pendingCount > 9 ? '+' : pendingCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout; 