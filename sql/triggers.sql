-- =============================================================
-- CSI2132 e-Hotels — triggers.sql
-- Run after schema.sql, before populate.sql
-- =============================================================

-- =============================================================
-- TRIGGER 1: Archive a Booking before it is deleted
-- Implements user-defined constraint: history must be preserved
-- even after the original booking row is removed.
-- =============================================================
CREATE OR REPLACE FUNCTION fn_archive_booking()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO ArchiveBooking (bookingID, startDate, endDate, customerFirstName, customerLastName, roomID)
    SELECT
        OLD.bookingID,
        OLD.startDate,
        OLD.endDate,
        c.firstName,
        c.lastName,
        OLD.roomID
    FROM Customer c
    WHERE c.customerID = OLD.customerID;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_archive_booking
BEFORE DELETE ON Booking
FOR EACH ROW EXECUTE FUNCTION fn_archive_booking();

-- =============================================================
-- TRIGGER 2: Archive a Renting before it is deleted.
-- Also copies Room_damage rows into ArchiveRenting_damageBeforeCheckIn
-- (captures the room condition known at renting time).
-- =============================================================
CREATE OR REPLACE FUNCTION fn_archive_renting()
RETURNS TRIGGER AS $$
DECLARE
    v_archiveID INT;
BEGIN
    INSERT INTO ArchiveRenting (rentingID, startDate, endDate, customerFirstName, customerLastName, roomID)
    SELECT
        OLD.rentingID,
        OLD.startDate,
        OLD.endDate,
        c.firstName,
        c.lastName,
        OLD.roomID
    FROM Customer c
    WHERE c.customerID = OLD.customerID
    RETURNING archiveRentingID INTO v_archiveID;

    -- Copy current room damages as "before check-in" snapshot
    INSERT INTO ArchiveRenting_damageBeforeCheckIn (archiveRentingID, damageName)
    SELECT v_archiveID, damageName
    FROM Room_damage
    WHERE roomID = OLD.roomID;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_archive_renting
BEFORE DELETE ON Renting
FOR EACH ROW EXECUTE FUNCTION fn_archive_renting();

-- =============================================================
-- TRIGGER 3: Mark room as 'Booked' when a new Booking is created.
-- Implements constraint: a room can only be booked by one customer at a time.
-- =============================================================
CREATE OR REPLACE FUNCTION fn_room_set_booked()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Room
    SET bookingStatus = 'Booked'
    WHERE roomID = NEW.roomID;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_room_set_booked
AFTER INSERT ON Booking
FOR EACH ROW EXECUTE FUNCTION fn_room_set_booked();

-- =============================================================
-- TRIGGER 4: Restore room to 'Available' after a Booking is deleted,
-- but only if no active Renting overlaps today's date for that room.
-- (The BEFORE DELETE archive trigger fires first, then this one.)
-- =============================================================
CREATE OR REPLACE FUNCTION fn_room_restore_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM Renting
        WHERE roomID = OLD.roomID
          AND endDate >= CURRENT_DATE
    ) THEN
        UPDATE Room
        SET bookingStatus = 'Available'
        WHERE roomID = OLD.roomID;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_room_restore_status
AFTER DELETE ON Booking
FOR EACH ROW EXECUTE FUNCTION fn_room_restore_status();

-- =============================================================
-- TRIGGER 5: Mark room as 'Rented' when a new Renting is created
-- (covers walk-in rentals where no booking exists).
-- =============================================================
CREATE OR REPLACE FUNCTION fn_room_set_rented()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Room
    SET bookingStatus = 'Rented'
    WHERE roomID = NEW.roomID;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_room_set_rented
AFTER INSERT ON Renting
FOR EACH ROW EXECUTE FUNCTION fn_room_set_rented();

-- =============================================================
-- TRIGGER 6: Update Hotel.roomCount automatically when rooms are
-- inserted or deleted (keeps the denormalized count in sync).
-- =============================================================
CREATE OR REPLACE FUNCTION fn_sync_room_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE Hotel SET roomCount = roomCount + 1 WHERE hotelID = NEW.hotelID;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE Hotel SET roomCount = roomCount - 1 WHERE hotelID = OLD.hotelID;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_room_count
AFTER INSERT OR DELETE ON Room
FOR EACH ROW EXECUTE FUNCTION fn_sync_room_count();
