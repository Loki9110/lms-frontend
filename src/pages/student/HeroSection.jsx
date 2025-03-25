import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/course/search?query=${searchQuery}`);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 text-white">
     
    </div>
  );
};

export default HeroSection;