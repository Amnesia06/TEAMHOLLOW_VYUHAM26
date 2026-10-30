"""
Multi-currency conversion helper (M13).
Fixed documented rate: 1 USD = 85.0 INR (README Section 12).
"""

from backend.app.core.config import settings


def convert_currency(amount: float, from_curr: str, to_curr: str) -> float:
    from_c = from_curr.upper()
    to_c = to_curr.upper()

    if from_c == to_c:
        return amount

    if from_c == "USD" and to_c == "INR":
        return round(amount * settings.USD_TO_INR_RATE, 2)

    if from_c == "INR" and to_c == "USD":
        return round(amount / settings.USD_TO_INR_RATE, 2)

    return amount

