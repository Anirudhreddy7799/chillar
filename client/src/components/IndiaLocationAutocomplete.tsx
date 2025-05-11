import { useState, useEffect, useRef } from 'react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Comprehensive list of Indian cities and states
const INDIA_LOCATIONS = [
  // States with major cities
  { value: "andhra-pradesh", label: "Andhra Pradesh (State)", group: "States" },
  { value: "visakhapatnam", label: "Visakhapatnam, Andhra Pradesh", group: "Cities" },
  { value: "vijayawada", label: "Vijayawada, Andhra Pradesh", group: "Cities" },
  { value: "guntur", label: "Guntur, Andhra Pradesh", group: "Cities" },
  { value: "nellore", label: "Nellore, Andhra Pradesh", group: "Cities" },
  { value: "kurnool", label: "Kurnool, Andhra Pradesh", group: "Cities" },
  { value: "kakinada", label: "Kakinada, Andhra Pradesh", group: "Cities" },
  { value: "tirupati", label: "Tirupati, Andhra Pradesh", group: "Cities" },
  
  { value: "arunachal-pradesh", label: "Arunachal Pradesh (State)", group: "States" },
  { value: "itanagar", label: "Itanagar, Arunachal Pradesh", group: "Cities" },
  { value: "naharlagun", label: "Naharlagun, Arunachal Pradesh", group: "Cities" },

  { value: "assam", label: "Assam (State)", group: "States" },
  { value: "guwahati", label: "Guwahati, Assam", group: "Cities" },
  { value: "silchar", label: "Silchar, Assam", group: "Cities" },
  { value: "dibrugarh", label: "Dibrugarh, Assam", group: "Cities" },
  { value: "jorhat", label: "Jorhat, Assam", group: "Cities" },
  
  { value: "bihar", label: "Bihar (State)", group: "States" },
  { value: "patna", label: "Patna, Bihar", group: "Cities" },
  { value: "gaya", label: "Gaya, Bihar", group: "Cities" },
  { value: "bhagalpur", label: "Bhagalpur, Bihar", group: "Cities" },
  { value: "muzaffarpur", label: "Muzaffarpur, Bihar", group: "Cities" },
  { value: "darbhanga", label: "Darbhanga, Bihar", group: "Cities" },
  
  { value: "chhattisgarh", label: "Chhattisgarh (State)", group: "States" },
  { value: "raipur", label: "Raipur, Chhattisgarh", group: "Cities" },
  { value: "bhilai", label: "Bhilai, Chhattisgarh", group: "Cities" },
  { value: "bilaspur", label: "Bilaspur, Chhattisgarh", group: "Cities" },
  { value: "korba", label: "Korba, Chhattisgarh", group: "Cities" },
  
  { value: "goa", label: "Goa (State)", group: "States" },
  { value: "panaji", label: "Panaji, Goa", group: "Cities" },
  { value: "margao", label: "Margao, Goa", group: "Cities" },
  { value: "vasco-da-gama", label: "Vasco da Gama, Goa", group: "Cities" },
  
  { value: "gujarat", label: "Gujarat (State)", group: "States" },
  { value: "ahmedabad", label: "Ahmedabad, Gujarat", group: "Cities" },
  { value: "surat", label: "Surat, Gujarat", group: "Cities" },
  { value: "vadodara", label: "Vadodara, Gujarat", group: "Cities" },
  { value: "rajkot", label: "Rajkot, Gujarat", group: "Cities" },
  { value: "gandhinagar", label: "Gandhinagar, Gujarat", group: "Cities" },
  { value: "jamnagar", label: "Jamnagar, Gujarat", group: "Cities" },
  { value: "junagadh", label: "Junagadh, Gujarat", group: "Cities" },
  { value: "bhavnagar", label: "Bhavnagar, Gujarat", group: "Cities" },
  
  { value: "haryana", label: "Haryana (State)", group: "States" },
  { value: "faridabad", label: "Faridabad, Haryana", group: "Cities" },
  { value: "gurgaon", label: "Gurgaon, Haryana", group: "Cities" },
  { value: "panipat", label: "Panipat, Haryana", group: "Cities" },
  { value: "ambala", label: "Ambala, Haryana", group: "Cities" },
  { value: "karnal", label: "Karnal, Haryana", group: "Cities" },
  { value: "hisar", label: "Hisar, Haryana", group: "Cities" },
  { value: "rohtak", label: "Rohtak, Haryana", group: "Cities" },
  
  { value: "himachal-pradesh", label: "Himachal Pradesh (State)", group: "States" },
  { value: "shimla", label: "Shimla, Himachal Pradesh", group: "Cities" },
  { value: "dharamshala", label: "Dharamshala, Himachal Pradesh", group: "Cities" },
  { value: "manali", label: "Manali, Himachal Pradesh", group: "Cities" },
  { value: "solan", label: "Solan, Himachal Pradesh", group: "Cities" },
  
  { value: "jharkhand", label: "Jharkhand (State)", group: "States" },
  { value: "ranchi", label: "Ranchi, Jharkhand", group: "Cities" },
  { value: "jamshedpur", label: "Jamshedpur, Jharkhand", group: "Cities" },
  { value: "dhanbad", label: "Dhanbad, Jharkhand", group: "Cities" },
  { value: "bokaro", label: "Bokaro, Jharkhand", group: "Cities" },
  
  { value: "karnataka", label: "Karnataka (State)", group: "States" },
  { value: "bangalore", label: "Bangalore, Karnataka", group: "Cities" },
  { value: "mysore", label: "Mysore, Karnataka", group: "Cities" },
  { value: "hubli", label: "Hubli, Karnataka", group: "Cities" },
  { value: "mangalore", label: "Mangalore, Karnataka", group: "Cities" },
  { value: "belgaum", label: "Belgaum, Karnataka", group: "Cities" },
  { value: "gulbarga", label: "Gulbarga, Karnataka", group: "Cities" },
  
  { value: "kerala", label: "Kerala (State)", group: "States" },
  { value: "thiruvananthapuram", label: "Thiruvananthapuram, Kerala", group: "Cities" },
  { value: "kochi", label: "Kochi, Kerala", group: "Cities" },
  { value: "kozhikode", label: "Kozhikode, Kerala", group: "Cities" },
  { value: "thrissur", label: "Thrissur, Kerala", group: "Cities" },
  { value: "kollam", label: "Kollam, Kerala", group: "Cities" },
  
  { value: "madhya-pradesh", label: "Madhya Pradesh (State)", group: "States" },
  { value: "indore", label: "Indore, Madhya Pradesh", group: "Cities" },
  { value: "bhopal", label: "Bhopal, Madhya Pradesh", group: "Cities" },
  { value: "jabalpur", label: "Jabalpur, Madhya Pradesh", group: "Cities" },
  { value: "gwalior", label: "Gwalior, Madhya Pradesh", group: "Cities" },
  { value: "ujjain", label: "Ujjain, Madhya Pradesh", group: "Cities" },
  
  { value: "maharashtra", label: "Maharashtra (State)", group: "States" },
  { value: "mumbai", label: "Mumbai, Maharashtra", group: "Cities" },
  { value: "pune", label: "Pune, Maharashtra", group: "Cities" },
  { value: "nagpur", label: "Nagpur, Maharashtra", group: "Cities" },
  { value: "thane", label: "Thane, Maharashtra", group: "Cities" },
  { value: "nashik", label: "Nashik, Maharashtra", group: "Cities" },
  { value: "aurangabad", label: "Aurangabad, Maharashtra", group: "Cities" },
  { value: "solapur", label: "Solapur, Maharashtra", group: "Cities" },
  { value: "kolhapur", label: "Kolhapur, Maharashtra", group: "Cities" },
  { value: "amravati", label: "Amravati, Maharashtra", group: "Cities" },
  
  { value: "manipur", label: "Manipur (State)", group: "States" },
  { value: "imphal", label: "Imphal, Manipur", group: "Cities" },
  
  { value: "meghalaya", label: "Meghalaya (State)", group: "States" },
  { value: "shillong", label: "Shillong, Meghalaya", group: "Cities" },
  
  { value: "mizoram", label: "Mizoram (State)", group: "States" },
  { value: "aizawl", label: "Aizawl, Mizoram", group: "Cities" },
  
  { value: "nagaland", label: "Nagaland (State)", group: "States" },
  { value: "kohima", label: "Kohima, Nagaland", group: "Cities" },
  { value: "dimapur", label: "Dimapur, Nagaland", group: "Cities" },
  
  { value: "odisha", label: "Odisha (State)", group: "States" },
  { value: "bhubaneswar", label: "Bhubaneswar, Odisha", group: "Cities" },
  { value: "cuttack", label: "Cuttack, Odisha", group: "Cities" },
  { value: "rourkela", label: "Rourkela, Odisha", group: "Cities" },
  { value: "brahmapur", label: "Brahmapur, Odisha", group: "Cities" },
  
  { value: "punjab", label: "Punjab (State)", group: "States" },
  { value: "ludhiana", label: "Ludhiana, Punjab", group: "Cities" },
  { value: "amritsar", label: "Amritsar, Punjab", group: "Cities" },
  { value: "jalandhar", label: "Jalandhar, Punjab", group: "Cities" },
  { value: "patiala", label: "Patiala, Punjab", group: "Cities" },
  { value: "mohali", label: "Mohali, Punjab", group: "Cities" },
  
  { value: "rajasthan", label: "Rajasthan (State)", group: "States" },
  { value: "jaipur", label: "Jaipur, Rajasthan", group: "Cities" },
  { value: "jodhpur", label: "Jodhpur, Rajasthan", group: "Cities" },
  { value: "udaipur", label: "Udaipur, Rajasthan", group: "Cities" },
  { value: "kota", label: "Kota, Rajasthan", group: "Cities" },
  { value: "ajmer", label: "Ajmer, Rajasthan", group: "Cities" },
  { value: "bikaner", label: "Bikaner, Rajasthan", group: "Cities" },
  
  { value: "sikkim", label: "Sikkim (State)", group: "States" },
  { value: "gangtok", label: "Gangtok, Sikkim", group: "Cities" },
  
  { value: "tamil-nadu", label: "Tamil Nadu (State)", group: "States" },
  { value: "chennai", label: "Chennai, Tamil Nadu", group: "Cities" },
  { value: "coimbatore", label: "Coimbatore, Tamil Nadu", group: "Cities" },
  { value: "madurai", label: "Madurai, Tamil Nadu", group: "Cities" },
  { value: "tiruchirappalli", label: "Tiruchirappalli, Tamil Nadu", group: "Cities" },
  { value: "salem", label: "Salem, Tamil Nadu", group: "Cities" },
  { value: "tirunelveli", label: "Tirunelveli, Tamil Nadu", group: "Cities" },
  
  { value: "telangana", label: "Telangana (State)", group: "States" },
  { value: "hyderabad", label: "Hyderabad, Telangana", group: "Cities" },
  { value: "warangal", label: "Warangal, Telangana", group: "Cities" },
  { value: "nizamabad", label: "Nizamabad, Telangana", group: "Cities" },
  { value: "karimnagar", label: "Karimnagar, Telangana", group: "Cities" },
  
  { value: "tripura", label: "Tripura (State)", group: "States" },
  { value: "agartala", label: "Agartala, Tripura", group: "Cities" },
  
  { value: "uttar-pradesh", label: "Uttar Pradesh (State)", group: "States" },
  { value: "lucknow", label: "Lucknow, Uttar Pradesh", group: "Cities" },
  { value: "kanpur", label: "Kanpur, Uttar Pradesh", group: "Cities" },
  { value: "ghaziabad", label: "Ghaziabad, Uttar Pradesh", group: "Cities" },
  { value: "agra", label: "Agra, Uttar Pradesh", group: "Cities" },
  { value: "meerut", label: "Meerut, Uttar Pradesh", group: "Cities" },
  { value: "varanasi", label: "Varanasi, Uttar Pradesh", group: "Cities" },
  { value: "allahabad", label: "Allahabad, Uttar Pradesh", group: "Cities" },
  { value: "bareilly", label: "Bareilly, Uttar Pradesh", group: "Cities" },
  { value: "aligarh", label: "Aligarh, Uttar Pradesh", group: "Cities" },
  { value: "moradabad", label: "Moradabad, Uttar Pradesh", group: "Cities" },
  { value: "saharanpur", label: "Saharanpur, Uttar Pradesh", group: "Cities" },
  { value: "gorakhpur", label: "Gorakhpur, Uttar Pradesh", group: "Cities" },
  
  { value: "uttarakhand", label: "Uttarakhand (State)", group: "States" },
  { value: "dehradun", label: "Dehradun, Uttarakhand", group: "Cities" },
  { value: "haridwar", label: "Haridwar, Uttarakhand", group: "Cities" },
  { value: "rishikesh", label: "Rishikesh, Uttarakhand", group: "Cities" },
  { value: "nainital", label: "Nainital, Uttarakhand", group: "Cities" },
  
  { value: "west-bengal", label: "West Bengal (State)", group: "States" },
  { value: "kolkata", label: "Kolkata, West Bengal", group: "Cities" },
  { value: "howrah", label: "Howrah, West Bengal", group: "Cities" },
  { value: "asansol", label: "Asansol, West Bengal", group: "Cities" },
  { value: "siliguri", label: "Siliguri, West Bengal", group: "Cities" },
  { value: "durgapur", label: "Durgapur, West Bengal", group: "Cities" },
  
  // Union Territories
  { value: "andaman-nicobar", label: "Andaman and Nicobar Islands (UT)", group: "Union Territories" },
  { value: "port-blair", label: "Port Blair, Andaman and Nicobar", group: "Cities" },
  
  { value: "chandigarh-ut", label: "Chandigarh (UT)", group: "Union Territories" },
  { value: "chandigarh", label: "Chandigarh City", group: "Cities" },
  
  { value: "dadra-nagar-haveli", label: "Dadra and Nagar Haveli (UT)", group: "Union Territories" },
  { value: "silvassa", label: "Silvassa, Dadra and Nagar Haveli", group: "Cities" },
  
  { value: "daman-diu", label: "Daman and Diu (UT)", group: "Union Territories" },
  { value: "daman", label: "Daman, Daman and Diu", group: "Cities" },
  { value: "diu", label: "Diu, Daman and Diu", group: "Cities" },
  
  { value: "delhi-ut", label: "Delhi (UT)", group: "Union Territories" },
  { value: "delhi", label: "New Delhi, Delhi", group: "Cities" },
  
  { value: "jammu-kashmir", label: "Jammu and Kashmir (UT)", group: "Union Territories" },
  { value: "srinagar", label: "Srinagar, Jammu and Kashmir", group: "Cities" },
  { value: "jammu", label: "Jammu, Jammu and Kashmir", group: "Cities" },
  
  { value: "ladakh", label: "Ladakh (UT)", group: "Union Territories" },
  { value: "leh", label: "Leh, Ladakh", group: "Cities" },
  
  { value: "lakshadweep", label: "Lakshadweep (UT)", group: "Union Territories" },
  { value: "kavaratti", label: "Kavaratti, Lakshadweep", group: "Cities" },
  
  { value: "puducherry", label: "Puducherry (UT)", group: "Union Territories" },
  { value: "puducherry-city", label: "Puducherry City, Puducherry", group: "Cities" },
];

// Group the locations by type
const GROUPED_LOCATIONS = {
  "Major Cities": INDIA_LOCATIONS.filter(loc => loc.group === "Cities" && ["mumbai", "delhi", "bangalore", "hyderabad", "chennai", "kolkata", "pune", "ahmedabad", "jaipur"].includes(loc.value)),
  "States": INDIA_LOCATIONS.filter(loc => loc.group === "States"),
  "Union Territories": INDIA_LOCATIONS.filter(loc => loc.group === "Union Territories"),
  "Other Cities": INDIA_LOCATIONS.filter(loc => loc.group === "Cities" && !["mumbai", "delhi", "bangalore", "hyderabad", "chennai", "kolkata", "pune", "ahmedabad", "jaipur"].includes(loc.value)),
};

interface IndiaLocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function IndiaLocationAutocomplete({
  value,
  onChange,
  disabled = false
}: IndiaLocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredLocations, setFilteredLocations] = useState<typeof INDIA_LOCATIONS>([]);
  
  // Find the display label for the current value
  const displayValue = value
    ? INDIA_LOCATIONS.find(location => location.value === value || location.label === value)?.label || value
    : "";
    
  // Update input value when prop changes
  useEffect(() => {
    setInputValue(displayValue);
  }, [value, displayValue]);

  // Handle input changes and filter locations
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    
    // Filter locations based on input
    if (newValue) {
      const filtered = INDIA_LOCATIONS.filter(location => 
        location.label.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredLocations(filtered);
      
      // If we have an exact match, select it
      const exactMatch = filtered.find(
        loc => loc.label.toLowerCase() === newValue.toLowerCase()
      );
      if (exactMatch) {
        onChange(exactMatch.value);
      } else if (filtered.length === 0) {
        // If no match, use the custom text as value
        onChange(newValue);
      }
    } else {
      // If input is empty, show commonly used locations
      setFilteredLocations([
        ...GROUPED_LOCATIONS["Major Cities"],
        ...GROUPED_LOCATIONS["States"].slice(0, 10)
      ]);
      onChange("");
    }
  };

  // Open the dropdown when input is focused
  const handleInputFocus = () => {
    if (!open) {
      setOpen(true);
      if (!inputValue) {
        // Show most common locations when opening with empty input
        setFilteredLocations([
          ...GROUPED_LOCATIONS["Major Cities"],
          ...GROUPED_LOCATIONS["States"].slice(0, 10)
        ]);
      }
    }
  };

  // Select a location from the dropdown
  const handleSelect = (selectedValue: string) => {
    const selected = INDIA_LOCATIONS.find(loc => loc.value === selectedValue);
    if (selected) {
      setInputValue(selected.label);
      onChange(selected.value);
    }
    setOpen(false);
  };

  // Group locations for display
  const groupedFilteredLocations = () => {
    if (!inputValue) {
      return [
        { 
          heading: "Major Cities", 
          items: GROUPED_LOCATIONS["Major Cities"]
        },
        { 
          heading: "States", 
          items: GROUPED_LOCATIONS["States"].slice(0, 10)
        }
      ];
    }
    
    // For search results, group by type
    const cities = filteredLocations.filter(loc => loc.group === "Cities");
    const states = filteredLocations.filter(loc => loc.group === "States");
    const uts = filteredLocations.filter(loc => loc.group === "Union Territories");
    
    const groups = [];
    
    if (cities.length) {
      groups.push({ heading: "Cities", items: cities });
    }
    
    if (states.length) {
      groups.push({ heading: "States", items: states });
    }
    
    if (uts.length) {
      groups.push({ heading: "Union Territories", items: uts });
    }
    
    return groups;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Type to search for city or state..."
            disabled={disabled}
            className="w-full pr-10"
          />
          <ChevronsUpDown 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" 
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search location..." value={inputValue} onValueChange={(value) => {
            setInputValue(value);
            if (value) {
              const filtered = INDIA_LOCATIONS.filter(location => 
                location.label.toLowerCase().includes(value.toLowerCase())
              );
              setFilteredLocations(filtered);
            } else {
              setFilteredLocations([
                ...GROUPED_LOCATIONS["Major Cities"],
                ...GROUPED_LOCATIONS["States"].slice(0, 10)
              ]);
            }
          }} />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No location found. You can use custom text.</CommandEmpty>
            {groupedFilteredLocations().map((group) => (
              <CommandGroup key={group.heading} heading={group.heading}>
                {group.items.map((location) => (
                  <CommandItem
                    key={location.value}
                    value={location.value}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === location.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {location.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}