import { Menu, School, User, BookOpen, Presentation, LogOut, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DarkMode from "@/DarkMode";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { Badge } from "./ui/badge";
import { useGetPendingRequestsCountQuery } from "@/features/api/purchaseApi";
import PropTypes from "prop-types";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();
  const { data: pendingCount, isSuccess: countFetched } = useGetPendingRequestsCountQuery(
    undefined,
    { skip: !(user?.role === "INSTRUCTOR") }
  );
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoutHandler = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "User log out.");
      navigate("/login");
    }
  }, [isSuccess]);

  return (
    <div className={`h-16 fixed top-0 left-0 right-0 duration-300 z-50 ${
      scrolled 
        ? 'bg-white/80 dark:bg-[#020817]/80 backdrop-blur-md shadow-md' 
        : 'bg-white dark:bg-[#020817]'
      } border-b dark:border-b-gray-800 border-b-gray-200`}>
      {/* Desktop */}
      <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full">
        <div className="flex items-center gap-2">
          <School size={"30"} />
          <Link to="/">
            <h1 className="hidden md:block font-extrabold text-2xl">
              E-Learning
            </h1>
          </Link>
        </div>
        {/* User icons and dark mode icon  */}
        <div className="flex items-center gap-8">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage
                    src={user?.photoUrl || "https://github.com/shadcn.png"}
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuItem className="h-10">
                  <User className="mr-2 h-5 w-5" />
                  <Link
                    className="hover:translate-x-1 transition-all"
                    to="/profile"
                  >
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-10">
                  <BookOpen className="mr-2 h-5 w-5" />
                  <Link
                    className="hover:translate-x-1 transition-all"
                    to="/my-learning"
                  >
                    My learning
                  </Link>
                </DropdownMenuItem>
                {user.role === "INSTRUCTOR" && (
                  <DropdownMenuItem className="h-10">
                    <Presentation className="mr-2 h-5 w-5" />
                    <Link
                      className="hover:translate-x-1 transition-all"
                      to="/instructor/dashboard"
                    >
                      Instructor Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "ADMIN" && (
                  <DropdownMenuItem className="h-10">
                    <Presentation className="mr-2 h-5 w-5" />
                    <Link
                      className="hover:translate-x-1 transition-all"
                      to="/admin/dashboard"
                    >
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logoutHandler}
                  className="h-10 cursor-pointer"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  <span className="hover:translate-x-1 transition-all">
                    Log out
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(user.role === "ADMIN" && countFetched) && (
                  <>
                    <DropdownMenuItem className="h-10">
                      <Bell className="mr-2 h-5 w-5" />
                      <Link
                        className="hover:translate-x-1 transition-all"
                        to="/admin/purchase-requests"
                      >
                        <div className="flex items-center gap-2">
                          <span>Notifications</span>
                          <div className="bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">
                            {pendingCount}
                          </div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/login")}>Signup</Button>
            </div>
          )}
          <DarkMode />
        </div>
      </div>
      {/* Mobile device  */}
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <h1 className="font-extrabold text-2xl">E-learning</h1>
        <MobileNavbar user={user} pendingCount={pendingCount} countFetched={countFetched}/>
      </div>
    </div>
  );
};

export default Navbar;

const MobileNavbar = ({user, pendingCount, countFetched}) => {
  const navigate = useNavigate();
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="rounded-full hover:bg-gray-200"
          variant="outline"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="flex flex-row items-center justify-between mt-2">
          <SheetTitle> <Link to="/">E-Learning</Link></SheetTitle>
          <DarkMode />
        </SheetHeader>
        <Separator className="mr-2" />
        <nav className="flex flex-col space-y-4">
          <Link to="/my-learning">My Learning</Link>
          <Link to="/profile">Edit Profile</Link>
          <p>Log out</p>
        </nav>
        {user?.role === "INSTRUCTOR" && (
          <SheetFooter>
            <SheetClose asChild>
              <Button 
                type="submit" 
                onClick={()=> navigate("/instructor/dashboard")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:text-white"
              >
                Dashboard
                {countFetched && pendingCount > 0 && (
                  <Badge 
                    className="bg-red-500 text-white h-3 w-3 flex items-center justify-center rounded-full text-[9px] ml-1"
                    variant="destructive"
                  >
                    {pendingCount > 9 ? '+' : pendingCount}
                  </Badge>
                )}
              </Button>
            </SheetClose>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

MobileNavbar.propTypes = {
  user: PropTypes.object,
  pendingCount: PropTypes.number,
  countFetched: PropTypes.bool
};
