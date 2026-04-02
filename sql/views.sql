-- =============================================================
-- CSI2132 e-Hotels — views.sql
-- =============================================================

-- =============================================================
-- VIEW 1 (required): Number of available rooms per area.
-- "Area" is the city extracted from Hotel.address.
-- Address format expected: "123 Street, City, Province"
-- City is the 2nd comma-separated segment.
-- =============================================================
CREATE OR REPLACE VIEW available_rooms_per_area AS
SELECT
    TRIM(SPLIT_PART(h.address, ',', 2)) AS area,
    COUNT(r.roomID)                      AS available_room_count
FROM Room r
JOIN Hotel h ON r.hotelID = h.hotelID
WHERE r.bookingStatus = 'Available'
GROUP BY TRIM(SPLIT_PART(h.address, ',', 2))
ORDER BY available_room_count DESC;

-- =============================================================
-- VIEW 2 (required): Aggregated capacity of all rooms per hotel.
-- =============================================================
CREATE OR REPLACE VIEW hotel_room_capacity AS
SELECT
    h.hotelID,
    h.hotelName,
    h.address,
    hc.chainName,
    h.starCount,
    COUNT(r.roomID)  AS room_count,
    COALESCE(SUM(r.capacity), 0) AS total_capacity
FROM Hotel h
JOIN HotelChain hc ON h.chainID = hc.chainID
LEFT JOIN Room r    ON r.hotelID = h.hotelID
GROUP BY h.hotelID, h.hotelName, h.address, hc.chainName, h.starCount
ORDER BY h.hotelName;

-- =============================================================
-- VIEW 3 (bonus): All active bookings with full details for
-- the employee check-in dashboard.
-- =============================================================
CREATE OR REPLACE VIEW active_bookings_detail AS
SELECT
    b.bookingID,
    b.startDate,
    b.endDate,
    b.roomID,
    r.price,
    r.capacity,
    r.viewType,
    h.hotelName,
    h.address    AS hotelAddress,
    hc.chainName,
    c.customerID,
    c.firstName  AS customerFirstName,
    c.lastName   AS customerLastName,
    -- Has this booking already been converted to a renting?
    (ci.rentingID IS NOT NULL) AS checkedIn
FROM Booking b
JOIN Room r         ON r.roomID     = b.roomID
JOIN Hotel h        ON h.hotelID    = r.hotelID
JOIN HotelChain hc  ON hc.chainID   = h.chainID
JOIN Customer c     ON c.customerID = b.customerID
LEFT JOIN Check_in ci ON ci.bookingID = b.bookingID
ORDER BY b.startDate;
