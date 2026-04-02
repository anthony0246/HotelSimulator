-- =============================================================
-- CSI2132 e-Hotels — indexes.sql
-- =============================================================

-- INDEX 1: Room → Hotel joins
-- Justification: The most frequent join in the application is
-- Room JOIN Hotel (room availability search, hotel dashboard).
-- Without this index every Room scan must do a full Hotel scan.
CREATE INDEX IF NOT EXISTS idx_room_hotel
    ON Room(hotelID);

-- INDEX 2: Booking date-range overlap check
-- Justification: The availability search uses a NOT EXISTS subquery
--   WHERE b.roomID = $1 AND b.startDate < $endDate AND b.endDate > $startDate
-- This composite index lets PostgreSQL satisfy the predicate entirely
-- from the index (index-only scan) without touching the heap.
CREATE INDEX IF NOT EXISTS idx_booking_room_dates
    ON Booking(roomID, startDate, endDate);

-- INDEX 3: Renting date-range overlap check (same pattern as bookings)
-- Justification: Identical reasoning to INDEX 2. Availability search
-- also excludes rooms already in an active Renting for the requested dates.
CREATE INDEX IF NOT EXISTS idx_renting_room_dates
    ON Renting(roomID, startDate, endDate);

-- INDEX 4: Hotel → HotelChain join / chain-level filtering
-- Justification: Revenue-per-chain aggregation (Query 2) and the
-- chain dropdown filter in search both join Hotel ON chainID.
-- With 40+ hotels this saves a sequential scan on every chain query.
CREATE INDEX IF NOT EXISTS idx_hotel_chain
    ON Hotel(chainID);
