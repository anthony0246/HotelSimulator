-- =============================================================
-- CSI2132 e-Hotels — schema.sql
-- Run order: schema.sql → triggers.sql → views.sql → indexes.sql → populate.sql
-- =============================================================

-- Clean slate (drop in reverse dependency order)
DROP TABLE IF EXISTS ArchiveRenting_damageAfterCheckIn CASCADE;
DROP TABLE IF EXISTS ArchiveRenting_damageBeforeCheckIn CASCADE;
DROP TABLE IF EXISTS ArchiveRenting CASCADE;
DROP TABLE IF EXISTS ArchiveBooking CASCADE;
DROP TABLE IF EXISTS Check_in CASCADE;
DROP TABLE IF EXISTS Renting CASCADE;
DROP TABLE IF EXISTS Booking CASCADE;
DROP TABLE IF EXISTS Room_damage CASCADE;
DROP TABLE IF EXISTS Room_amenity CASCADE;
DROP TABLE IF EXISTS Room CASCADE;
DROP TABLE IF EXISTS Customer CASCADE;
DROP TABLE IF EXISTS Employee_role CASCADE;
DROP TABLE IF EXISTS Hotel_phoneNumber CASCADE;
DROP TABLE IF EXISTS Hotel CASCADE;
DROP TABLE IF EXISTS Employee CASCADE;
DROP TABLE IF EXISTS HotelChain_emailAddress CASCADE;
DROP TABLE IF EXISTS HotelChain_phoneNumber CASCADE;
DROP TABLE IF EXISTS HotelChain CASCADE;

-- =============================================================
-- 1. HotelChain
-- =============================================================
CREATE TABLE HotelChain (
    chainID               SERIAL PRIMARY KEY,
    chainName             VARCHAR(100) NOT NULL UNIQUE,
    centralOfficeAddress  VARCHAR(255) NOT NULL
);

-- =============================================================
-- 2. Employee  (hotelID nullable here — FK added after Hotel is created)
-- =============================================================
CREATE TABLE Employee (
    employeeID  SERIAL PRIMARY KEY,
    firstName   VARCHAR(50)  NOT NULL,
    lastName    VARCHAR(50)  NOT NULL,
    address     VARCHAR(255) NOT NULL,
    SSN         VARCHAR(20)  NOT NULL UNIQUE,
    hotelID     INT          -- FK to Hotel added below via ALTER TABLE
);

-- =============================================================
-- 3. Hotel  (managerID NOT NULL — total participation)
-- =============================================================
CREATE TABLE Hotel (
    hotelID    SERIAL PRIMARY KEY,
    hotelName  VARCHAR(100) NOT NULL,
    address    VARCHAR(255) NOT NULL,  -- format: "123 Street, City, Province"
    starCount  INT          NOT NULL CHECK (starCount BETWEEN 1 AND 5),
    roomCount  INT          DEFAULT 0,
    email      VARCHAR(100),
    chainID    INT          NOT NULL REFERENCES HotelChain(chainID) ON DELETE CASCADE,
    managerID  INT          NOT NULL REFERENCES Employee(employeeID)
);

-- 4. Close the circular FK: Employee → Hotel
ALTER TABLE Employee
    ADD CONSTRAINT fk_employee_hotel
    FOREIGN KEY (hotelID) REFERENCES Hotel(hotelID) ON DELETE SET NULL;

-- =============================================================
-- 5. HotelChain contact info
-- =============================================================
CREATE TABLE HotelChain_phoneNumber (
    chainID      INT         NOT NULL REFERENCES HotelChain(chainID) ON DELETE CASCADE,
    phoneNumber  VARCHAR(20) NOT NULL,
    PRIMARY KEY (chainID, phoneNumber)
);

CREATE TABLE HotelChain_emailAddress (
    chainID       INT         NOT NULL REFERENCES HotelChain(chainID) ON DELETE CASCADE,
    emailAddress  VARCHAR(100) NOT NULL,
    PRIMARY KEY (chainID, emailAddress)
);

-- =============================================================
-- 6. Hotel contact info
-- =============================================================
CREATE TABLE Hotel_phoneNumber (
    hotelID     INT         NOT NULL REFERENCES Hotel(hotelID) ON DELETE CASCADE,
    phoneNumber VARCHAR(20) NOT NULL,
    PRIMARY KEY (hotelID, phoneNumber)
);

-- =============================================================
-- 7. Employee roles (finite set enforced by CHECK)
-- =============================================================
CREATE TABLE Employee_role (
    employeeID  INT         NOT NULL REFERENCES Employee(employeeID) ON DELETE CASCADE,
    role        VARCHAR(20) NOT NULL CHECK (role IN ('Manager','Receptionist','Housekeeper','Maintenance','Concierge')),
    PRIMARY KEY (employeeID, role)
);

-- =============================================================
-- 8. Customer
-- =============================================================
CREATE TABLE Customer (
    customerID        SERIAL PRIMARY KEY,
    firstName         VARCHAR(50)  NOT NULL,
    lastName          VARCHAR(50)  NOT NULL,
    address           VARCHAR(255) NOT NULL,
    idType            VARCHAR(20)  NOT NULL CHECK (idType IN ('SSN','SIN','Driving Licence')),
    idNumber          VARCHAR(50)  NOT NULL UNIQUE,
    registrationDate  DATE         NOT NULL DEFAULT CURRENT_DATE
);

-- =============================================================
-- 9. Room
-- =============================================================
CREATE TABLE Room (
    roomID         SERIAL PRIMARY KEY,
    hotelID        INT            NOT NULL REFERENCES Hotel(hotelID) ON DELETE CASCADE,
    price          DECIMAL(10,2)  NOT NULL CHECK (price > 0),
    capacity       INT            NOT NULL CHECK (capacity >= 1),
    viewType       VARCHAR(20)    CHECK (viewType IN ('Sea','Mountain')),
    extendability  BOOLEAN        NOT NULL DEFAULT FALSE,
    bookingStatus  VARCHAR(20)    NOT NULL DEFAULT 'Available'
                                  CHECK (bookingStatus IN ('Available','Booked','Rented'))
);

-- =============================================================
-- 10. Room amenities and damages
-- =============================================================
CREATE TABLE Room_amenity (
    roomID      INT         NOT NULL REFERENCES Room(roomID) ON DELETE CASCADE,
    amenityName VARCHAR(50) NOT NULL,
    PRIMARY KEY (roomID, amenityName)
);

CREATE TABLE Room_damage (
    roomID      INT         NOT NULL REFERENCES Room(roomID) ON DELETE CASCADE,
    damageName  VARCHAR(100) NOT NULL,
    PRIMARY KEY (roomID, damageName)
);

-- =============================================================
-- 11. Booking
-- =============================================================
CREATE TABLE Booking (
    bookingID   SERIAL PRIMARY KEY,
    startDate   DATE NOT NULL,
    endDate     DATE NOT NULL,
    roomID      INT  NOT NULL REFERENCES Room(roomID),
    customerID  INT  NOT NULL REFERENCES Customer(customerID),
    CHECK (endDate > startDate)
);

-- =============================================================
-- 12. Renting  (employeeID NOT NULL — every renting processed by an employee)
-- =============================================================
CREATE TABLE Renting (
    rentingID   SERIAL PRIMARY KEY,
    startDate   DATE    NOT NULL,
    endDate     DATE    NOT NULL,
    roomID      INT     NOT NULL REFERENCES Room(roomID),
    customerID  INT     NOT NULL REFERENCES Customer(customerID),
    employeeID  INT     NOT NULL REFERENCES Employee(employeeID),
    paid        BOOLEAN NOT NULL DEFAULT FALSE,
    CHECK (endDate > startDate)
);

-- =============================================================
-- 13. Check_in — links a Booking to the Renting it became
--     Renting rows WITHOUT a Check_in row = walk-in (no prior booking)
-- =============================================================
CREATE TABLE Check_in (
    bookingID  INT NOT NULL UNIQUE REFERENCES Booking(bookingID) ON DELETE CASCADE,
    rentingID  INT NOT NULL UNIQUE REFERENCES Renting(rentingID) ON DELETE CASCADE,
    PRIMARY KEY (bookingID, rentingID)
);

-- =============================================================
-- 14. Archives  (survive even if Room/Customer are deleted)
-- =============================================================
CREATE TABLE ArchiveBooking (
    archiveBookingID   SERIAL PRIMARY KEY,
    bookingID          INT          NOT NULL,
    startDate          DATE         NOT NULL,
    endDate            DATE         NOT NULL,
    customerFirstName  VARCHAR(50)  NOT NULL,
    customerLastName   VARCHAR(50)  NOT NULL,
    roomID             INT          NOT NULL
);

CREATE TABLE ArchiveRenting (
    archiveRentingID   SERIAL PRIMARY KEY,
    rentingID          INT         NOT NULL,
    startDate          DATE        NOT NULL,
    endDate            DATE        NOT NULL,
    customerFirstName  VARCHAR(50) NOT NULL,
    customerLastName   VARCHAR(50) NOT NULL,
    roomID             INT         NOT NULL
);

CREATE TABLE ArchiveRenting_damageBeforeCheckIn (
    archiveRentingID  INT          NOT NULL REFERENCES ArchiveRenting(archiveRentingID) ON DELETE CASCADE,
    damageName        VARCHAR(100) NOT NULL,
    PRIMARY KEY (archiveRentingID, damageName)
);

CREATE TABLE ArchiveRenting_damageAfterCheckIn (
    archiveRentingID  INT          NOT NULL REFERENCES ArchiveRenting(archiveRentingID) ON DELETE CASCADE,
    damageName        VARCHAR(100) NOT NULL,
    PRIMARY KEY (archiveRentingID, damageName)
);
