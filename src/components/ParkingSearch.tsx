"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Calendar, Clock } from "lucide-react";
import { useState } from "react";

const karnatakaCities = [
  "Bangalore",
  "Mysore",
  "Mangalore",
  "Hubli",
  "Belgaum",
  "Gulbarga",
  "Davangere",
  "Bellary",
  "Bijapur",
  "Shimoga",
  "Tumkur",
  "Raichur",
  "Bidar",
  "Hospet",
  "Hassan",
  "Gadag",
  "Udupi",
  "Chitradurga",
];

export default function ParkingSearch() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSearch = () => {
    console.log("Searching for parking:", { location, date, time });
  };

  return (
    <Card className="p-6 shadow-xl border-2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location Input */}
        <div className="relative">
          <label className="text-sm font-medium mb-2 block">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter city or area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
              list="cities"
            />
            <datalist id="cities">
              {karnatakaCities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Date Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Time Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <Button onClick={handleSearch} className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Search Parking
          </Button>
        </div>
      </div>
    </Card>
  );
}