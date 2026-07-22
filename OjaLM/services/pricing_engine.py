class PricingEngine:
    @staticmethod
    def get_baseline_price(product_id, market_id):
        """
        Retrieves the moving average price for a product in a specific market.
        Mock implementation.
        """
        import random
        return random.randint(1000, 20000)

    @staticmethod
    def calculate_deviation(reported_price, baseline_price):
        if baseline_price == 0:
            return 0.0
        deviation = abs(reported_price - baseline_price) / baseline_price
        return deviation
    
    @staticmethod
    def is_price_plausible(reported_price, product_id, market_id, threshold=0.3):
        """
        Checks if the reported price is within the acceptable threshold (e.g., 30%).
        """
        baseline = PricingEngine.get_baseline_price(product_id, market_id)
        dev = PricingEngine.calculate_deviation(reported_price, baseline)
        return dev <= threshold
