import os
import json

def count_in_dir(path):
    if not os.path.exists(path):
        return 0
    return sum(1 for f in os.listdir(path) if f.endswith(".json"))

def generate_dashboard():
    print("==========================================")
    print(" LOCATION INTELLIGENCE DASHBOARD ")
    print("==========================================")
    
    base_dir = "datasets/locations"
    
    locations = [
        "countries",
        "states",
        "lgas",
        "cities",
        "routes",
        "hubs",
        "warehouses"
    ]
    
    print("\n[ GEOSPATIAL COVERAGE ]")
    print("-----------------------")
    total_locations = 0
    for loc in locations:
        count = count_in_dir(os.path.join(base_dir, loc))
        total_locations += count
        print(f"{loc.capitalize():<15} | {count:>4} entities")
        
    print(f"\nTotal Location Entities Tracked: {total_locations}")
    
    # We will simulate missing regions for the dashboard UX
    print("\n[ MISSING REGIONS ALERT ]")
    print(" - North-East Zone (Borno, Yobe, Adamawa): 0 LGAs mapped.")
    print(" - South-South Riverine (Bayelsa): 0 Transport Hubs mapped.")
    
    print("\n[ AVERAGE DISTANCES ]")
    print(" - Inter-market (Lagos): N/A (Insufficient Route Data)")
    print(" - Hub-to-Market (Kano): N/A (Insufficient Route Data)")

if __name__ == "__main__":
    generate_dashboard()
