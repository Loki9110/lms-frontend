import { useLoadUserQuery } from "@/features/api/authApi";
import { Lock } from "lucide-react";

const AllowAccess = () => {
  const { data } = useLoadUserQuery();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <Lock className="h-16 w-16 text-blue-600 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Welcome, {data?.user?.name}!</h1>
      <p className="text-gray-600 text-lg">
        You have administrative access to manage courses, users, and system settings.
      </p>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">
          With great power comes great responsibility. Use your admin privileges wisely!
        </p>
      </div>
    </div>
  );
};

export default AllowAccess; 