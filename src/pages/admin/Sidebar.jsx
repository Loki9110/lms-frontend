import { ChartNoAxesColumn, SquareLibrary, Home, Users, Lock } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useGetPendingRequestsCountQuery } from "@/features/api/purchaseApi";
import { Badge } from "@/components/ui/badge";

const Sidebar = () => {
  const { data: pendingCount, isSuccess } = useGetPendingRequestsCountQuery();
  const location = useLocation();

  const isActive = (path) => {
    // Remove 'admin/' prefix for path matching
    const currentPath = location.pathname.replace('/admin/', '');
    
    // For exact matches
    if (currentPath === path) return true;
    
    // For purchase-requests route
    if (path === "purchase-requests" && currentPath.includes("purchase-requests")) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="flex">
      <div className="hidden lg:block w-[250px] sm:w-[300px] space-y-8 border-r border-gray-300 dark:border-gray-700 p-5 sticky top-0 h-screen">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
            <Home size={22} />
            <h1>Home</h1>
          </Link>
          <Link to="dashboard" className={`flex items-center gap-2 hover:text-blue-600 hover:text-white transition-colors ${isActive("dashboard") ? "text-blue-600" : ""}`}>
            <ChartNoAxesColumn size={22} />
            <h1>Dashboard</h1>
          </Link>
          <Link to="course" className={`flex items-center gap-2 hover:text-blue-600 hover:text-white transition-colors ${isActive("course") ? "text-blue-600" : ""}`}>
            <SquareLibrary size={22} />
            <h1>Courses</h1>
          </Link>
          <Link to="users" className={`flex items-center gap-2 hover:text-blue-600 hover:text-white transition-colors ${isActive("users") ? "text-blue-600" : ""}`}>
            <Users size={22} />
            <h1>Users</h1>
          </Link>
          <Link to="purchase-requests" className={`flex items-center gap-2 hover:text-blue-600 hover:text-white transition-colors ${isActive("purchase-requests") ? "text-blue-600" : ""}`}>
            <Lock size={22} className={isActive("purchase-requests") ? "text-blue-600" : ""} />
            <h1>Allow Access</h1>
            {isSuccess && pendingCount > 0 && (
              <Badge 
                className="bg-red-500 text-white h-3 w-3 flex items-center justify-center rounded-full text-[9px] ml-1"
                variant="destructive"
              >
                {pendingCount > 9 ? '+' : pendingCount}
              </Badge>
            )}
          </Link>
        </div>
      </div>
      <div className="flex-1 p-10">
        <Outlet/>
      </div>
    </div>
  );
};

export default Sidebar;
