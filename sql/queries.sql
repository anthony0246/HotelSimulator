-- =============================================================
-- CSI2132 e-Hotels — queries.sql
-- =============================================================

-- =============================================================
-- QUERY 1: Available room search (NOT EXISTS — nested query)
-- Find all rooms available for a given date range, with optional
-- filters on capacity, area (city), chain, star rating, price.
-- Parameters shown as literals for demonstration; replace with
-- $1, $2, etc. when called from the application.
-- =============================================================
SELECT
    r.roomID,
    r.price,
    r.capacity,
    r.viewType,
    r.extendability,
    r.bookingStatus,
    h.hotelID,
    h.hotelName,
    h.address,
    h.starCount,
    h.email        AS hotelEmail,
    hc.chainID,
    hc.chainName
FROM Room r
JOIN Hotel h       ON h.hotelID  = r.hotelID
JOIN HotelChain hc ON hc.chainID = h.chainID
WHERE r.bookingStatus = 'Available'
  -- date overlap: new[start,end) overlaps existing[start,end) when existing.start < new.end AND existing.end > new.start
  AND NOT EXISTS (
      SELECT 1 FROM Booking b
      WHERE b.roomID    = r.roomID
        AND b.startDate < '2026-05-10'   -- replace with :endDate
        AND b.endDate   > '2026-05-01'   -- replace with :startDate
  )
  AND NOT EXISTS (
      SELECT 1 FROM Renting rt
      WHERE rt.roomID    = r.roomID
        AND rt.startDate < '2026-05-10'
        AND rt.endDate   > '2026-05-01'
  )
  -- optional filters (comment out to remove)
  AND r.capacity  >= 2                   -- minimum capacity
  AND r.price     <= 300.00              -- max price
  AND h.starCount  = 4                   -- star rating
ORDER BY r.price ASC;

-- =============================================================
-- QUERY 2: Total revenue per hotel chain (aggregation)
-- Revenue = price × number of nights (endDate - startDate)
-- =============================================================
SELECT
    hc.chainName,
    COUNT(rt.rentingID)                               AS total_rentings,
    SUM(r.price * (rt.endDate - rt.startDate))        AS total_revenue
FROM Renting rt
JOIN Room r        ON r.roomID  = rt.roomID
JOIN Hotel h       ON h.hotelID = r.hotelID
JOIN HotelChain hc ON hc.chainID = h.chainID
GROUP BY hc.chainName
ORDER BY total_revenue DESC;

-- =============================================================
-- QUERY 3: Top customers by number of bookings (aggregation + nested)
-- Returns customers ranked by how many bookings they have made.
-- =============================================================
SELECT
    c.customerID,
    c.firstName,
    c.lastName,
    ranked.bookingCount
FROM Customer c
JOIN (
    SELECT customerID, COUNT(*) AS bookingCount
    FROM Booking
    GROUP BY customerID
) AS ranked ON c.customerID = ranked.customerID
ORDER BY ranked.bookingCount DESC, c.lastName ASC;

-- =============================================================
-- QUERY 4: Rooms that have ALL of a given set of amenities (nested EXISTS)
-- Finds rooms that have both 'WiFi' AND 'Air Conditioning'.
-- =============================================================
SELECT
    r.roomID,
    h.hotelName,
    h.address,
    hc.chainName,
    r.price,
    r.capacity,
    r.viewType,
    r.bookingStatus
FROM Room r
JOIN Hotel h       ON h.hotelID  = r.hotelID
JOIN HotelChain hc ON hc.chainID = h.chainID
WHERE EXISTS (
    SELECT 1 FROM Room_amenity ra
    WHERE ra.roomID     = r.roomID
      AND ra.amenityName = 'WiFi'
)
AND EXISTS (
    SELECT 1 FROM Room_amenity ra2
    WHERE ra2.roomID     = r.roomID
      AND ra2.amenityName = 'Air Conditioning'
)
ORDER BY r.price ASC;

-- =============================================================
-- BONUS QUERY 5: Hotels with average room price per star category
-- =============================================================
SELECT
    h.starCount,
    COUNT(DISTINCT h.hotelID)  AS hotel_count,
    COUNT(r.roomID)            AS total_rooms,
    ROUND(AVG(r.price), 2)    AS avg_room_price,
    MIN(r.price)               AS min_price,
    MAX(r.price)               AS max_price
FROM Hotel h
JOIN Room r ON r.hotelID = h.hotelID
GROUP BY h.starCount
ORDER BY h.starCount;
