import math

class LocationEngine:
    @staticmethod
    def calculate_distance(loc1_name, loc2_name):
        """
        Mock distance calculation. 
        In production, this would use geospatial DB or Haversine formula based on lat/long.
        """
        # For simulation, if they are in the same state, distance is random between 0.1 and 15km
        # Here we just mock a float
        import random
        return round(random.uniform(0.1, 15.0), 2)
    
    @staticmethod
    def is_within_radius(scout_location, target_location, radius_km=5.0):
        distance = LocationEngine.calculate_distance(scout_location, target_location)
        return distance <= radius_km
