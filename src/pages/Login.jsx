import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [signupInput, setSignupInput] = useState({
    name: "",
    phone_number: "",
    email: "",
    password: "",
    role: "USER"
  });
  const [loginInput, setLoginInput] = useState({ 
    identifier: "",
    password: "" 
  });
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: ""
  });
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);

  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();
  const [
    loginUser,
    {
      data: loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess,
    },
  ] = useLoginUserMutation();
  const navigate = useNavigate();

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(\+?91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    if (phone.startsWith('+')) return phone;
    
    if (phone.startsWith('91') && phone.length > 2) {
      return '+' + phone;
    }
    
    return '+91' + phone;
  };

  const isPhoneNumber = (input) => {
    return /^[0-9+]+$/.test(input);
  };

  const calculatePasswordStrength = (password) => {
    if (!password) {
      return { score: 0, message: "", color: "" };
    }

    let score = 0;
    let message = "";
    let color = "bg-gray-200";

    if (password.length >= 8) score += 1;
    
    if (/[A-Z]/.test(password)) score += 1;
    
    if (/[a-z]/.test(password)) score += 1;
    
    if (/[0-9]/.test(password)) score += 1;
    
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (password.length < 8) {
      message = "Password must be at least 8 characters";
      color = "bg-red-500";
    } else if (score <= 2) {
      message = "Weak";
      color = "bg-red-500";
    } else if (score === 3) {
      message = "Medium";
      color = "bg-yellow-500";
    } else if (score === 4) {
      message = "Strong";
      color = "bg-green-500";
    } else {
      message = "Very Strong";
      color = "bg-green-700";
    }

    return { score, message, color };
  };

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
      
      if (name === "password") {
        setPasswordStrength(calculatePasswordStrength(value));
      }
    } else {
      setLoginInput({ ...loginInput, [name]: value });
      
      if (name === "identifier") {
        setIsPhoneLogin(isPhoneNumber(value));
      }
    }
  };

  const handleRegistration = async (type) => {
    try {
      let hasErrors = false;
      if (type === "signup") {
        const { name, phone_number, email, password } = signupInput;
        
        if (!validatePhoneNumber(phone_number)) {
          setPhoneError("Please enter a valid 10-digit Indian phone number");
          hasErrors = true;
        } else {
          setPhoneError("");
        }
        
        if (!validateEmail(email)) {
          setEmailError("Please enter a valid email address");
          hasErrors = true;
        } else {
          setEmailError("");
        }
        
        if (!name || !phone_number || !email || !password) {
          toast.error("Please fill in all required fields");
          hasErrors = true;
        }
        
        if (hasErrors) return;
        
        const formattedInput = {
          ...signupInput,
          phone_number: formatPhoneNumber(phone_number)
        };
        
        const response = await registerUser(formattedInput);
        
        if (response.error) {
          if (response.error.status === 403) {
            navigate("/verify-phone", { state: { userId: response.error.data.userId } });
          } else {
            toast.error(response.error.data?.message || "Signup failed");
          }
          return;
        }
        
        if (response.data?.success) {
          navigate("/verify-phone", { state: { userId: response.data.userId } });
        }
        
      } else {
        const { identifier, password } = loginInput;
        
        if (!identifier || !password) {
          toast.error("Please fill in all required fields");
          return;
        }
        
        let payload = { password };
        
        if (isPhoneLogin) {
          if (!validatePhoneNumber(identifier)) {
            setPhoneError("Please enter a valid 10-digit Indian phone number");
            return;
          } else {
            setPhoneError("");
          }
          
          payload.phone_number = formatPhoneNumber(identifier);
        } else {
          if (!validateEmail(identifier)) {
            setEmailError("Please enter a valid email address");
            return;
          } else {
            setEmailError("");
          }
          
          payload.email = identifier;
        }
        
        const response = await loginUser(payload);
        
        if (response.error) {
          toast.error(response.error.data?.message || "Login failed");
          return;
        }
        
        if (response.data?.success) {
          toast.success(response.data.message || "Login successful");
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (registerIsSuccess && registerData?.message) {
      toast.success(registerData.message);
    }
    if (registerError?.data) {
      toast.error(registerError.data.message || "Signup Failed");
    }
    if (loginIsSuccess && loginData?.message) {
      toast.success(loginData.message);
      navigate("/");
    }
    if (loginError?.data && loginError.status !== 403) {
      toast.error(loginError.data?.message || "Login Failed");
    }
  }, [
    loginData,
    registerData,
    loginError,
    registerError,
    navigate,
    loginIsSuccess,
    registerIsSuccess
  ]);

  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>
                Create a new account and click signup when you&apos;re done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={signupInput.name}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Eg. Saketh"
                  required={true}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={signupInput.email}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="your@email.com"
                  required={true}
                />
                {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                <p className="text-xs text-gray-500">Your email will be used for account verification and login.</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  type="text"
                  name="phone_number"
                  value={signupInput.phone_number}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="9XXXXXXXXX"
                  required={true}
                />
                {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
                <p className="text-xs text-gray-500">Enter your 10-digit number without country code. +91 will be added automatically.</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showSignupPassword ? "text" : "password"}
                    name="password"
                    value={signupInput.password}
                    onChange={(e) => changeInputHandler(e, "signup")}
                    placeholder="Enter password (min 8 chars)"
                    required={true}
                    minLength={8}
                    maxLength={50}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showSignupPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {passwordStrength.message && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">Password Strength:</span>
                      <span className="text-xs font-medium">{passwordStrength.message}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${passwordStrength.color}`} 
                        style={{ width: `${Math.min(100, (passwordStrength.score / 5) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1 text-gray-500">
                      Password should be at least 8 characters with uppercase, lowercase, number, and special character.
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={registerIsLoading}
                onClick={() => handleRegistration("signup")}
              >
                {registerIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : (
                  "Signup"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your email or phone and password to login.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="identifier">Email or Phone Number</Label>
                <Input
                  type="text"
                  name="identifier"
                  value={loginInput.identifier}
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder={isPhoneLogin ? "9XXXXXXXXX" : "your@email.com"}
                  required={true}
                />
                {(phoneError || emailError) && (
                  <p className="text-red-500 text-sm">{isPhoneLogin ? phoneError : emailError}</p>
                )}
                <p className="text-xs text-gray-500">
                  {isPhoneLogin 
                    ? "Enter your 10-digit number without country code. +91 will be added automatically." 
                    : "Enter the email address you registered with."}
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    value={loginInput.password}
                    onChange={(e) => changeInputHandler(e, "login")}
                    placeholder="Enter your password"
                    required={true}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={loginIsLoading}
                onClick={() => handleRegistration("login")}
              >
                {loginIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;