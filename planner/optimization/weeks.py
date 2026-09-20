"""ISO week helpers for consecutive-week constraints."""

from __future__ import annotations


def are_consecutive_iso_weeks(
    week_a: tuple[int, int],
    week_b: tuple[int, int],
) -> bool:
    """True if the two (iso_year, iso_week) pairs are adjacent on the calendar.

    Same year: week numbers differ by exactly 1 (e.g. 12 and 13).

    Across a year boundary: one side is week 1 of year N+1 and the other is
    the last week of year N (ISO years have 52 or 53 weeks, so "last" means
    week number >= 52).
    """
    year_a, w_a = week_a
    year_b, w_b = week_b
    if year_a == year_b:
        return abs(w_a - w_b) == 1
    earlier, later = (week_a, week_b) if week_a < week_b else (week_b, week_a)
    y0, w0 = earlier
    y1, w1 = later
    if y1 != y0 + 1 or w1 != 1:
        return False
    return w0 >= 52
