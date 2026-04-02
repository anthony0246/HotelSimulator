-- =============================================================
-- CSI2132 e-Hotels — populate.sql
-- Staged insertion order to handle Hotel <-> Employee circular FK:
--   Stage A: HotelChains
--   Stage B: Manager Employees (hotelID = NULL)
--   Stage C: Hotels (referencing manager employeeIDs)
--   Stage D: UPDATE managers with their hotelID
--   Stage E: Employee_role for managers
--   Stage F: Additional Employees (non-manager, with hotelID)
--   Stage G: Rooms (5+ per hotel)
--   Stage H: Room_amenity, Room_damage
--   Stage I: HotelChain/Hotel contact info
--   Stage J: Customers
--   Stage K: Bookings and Rentings (sample data)
-- =============================================================

-- =============================================================
-- STAGE A — Hotel Chains
-- =============================================================
INSERT INTO HotelChain (chainName, centralOfficeAddress) VALUES
    ('Marriott International', '7750 Wisconsin Ave, Bethesda, MD'),
    ('Hilton Hotels',          '7930 Jones Branch Dr, McLean, VA'),
    ('Hyatt Hotels',           '150 N Riverside Plaza, Chicago, IL'),
    ('IHG Hotels',             '3 Ravinia Dr, Atlanta, GA'),
    ('Wyndham Hotels',         '22 Sylvan Way, Parsippany, NJ');
-- chainIDs: Marriott=1, Hilton=2, Hyatt=3, IHG=4, Wyndham=5

-- =============================================================
-- STAGE B — Manager Employees (hotelID NULL for now)
-- 40 managers: 8 per chain, employees 1-40
-- =============================================================
INSERT INTO Employee (firstName, lastName, address, SSN) VALUES
-- Marriott managers (will manage hotels 1-8)
('James',    'Anderson',  '12 Maple St, Ottawa, ON',    'SSN-M-001'),
('Patricia', 'Johnson',   '34 Oak Ave, Toronto, ON',    'SSN-M-002'),
('Robert',   'Williams',  '56 Pine Rd, Montreal, QC',   'SSN-M-003'),
('Linda',    'Brown',     '78 Elm St, Vancouver, BC',   'SSN-M-004'),
('Michael',  'Jones',     '90 Cedar Blvd, Calgary, AB', 'SSN-M-005'),
('Barbara',  'Garcia',    '11 Birch Ln, Halifax, NS',   'SSN-M-006'),
('William',  'Martinez',  '22 Spruce Dr, Quebec, QC',   'SSN-M-007'),
('Elizabeth','Hernandez', '33 Walnut Pl, Winnipeg, MB', 'SSN-M-008'),
-- Hilton managers (will manage hotels 9-16)
('David',    'Lopez',     '44 Aspen Way, Ottawa, ON',   'SSN-M-009'),
('Jennifer', 'Gonzalez',  '55 Willow Ct, Toronto, ON',  'SSN-M-010'),
('Richard',  'Wilson',    '66 Poplar Ave, Montreal, QC','SSN-M-011'),
('Maria',    'Anderson',  '77 Ash St, Vancouver, BC',   'SSN-M-012'),
('Charles',  'Thomas',    '88 Hawthorn Dr, Calgary, AB','SSN-M-013'),
('Susan',    'Taylor',    '99 Magnolia Rd, Halifax, NS', 'SSN-M-014'),
('Joseph',   'Moore',     '10 Sequoia Blvd, Quebec, QC','SSN-M-015'),
('Jessica',  'Jackson',   '21 Acacia Ln, Winnipeg, MB', 'SSN-M-016'),
-- Hyatt managers (will manage hotels 17-24)
('Thomas',   'Martin',    '32 Cypress Way, Ottawa, ON',  'SSN-M-017'),
('Sarah',    'Lee',       '43 Juniper Ct, Toronto, ON',  'SSN-M-018'),
('Christopher','Perez',   '54 Laurel Ave, Montreal, QC', 'SSN-M-019'),
('Karen',    'Thompson',  '65 Yew St, Vancouver, BC',    'SSN-M-020'),
('Daniel',   'White',     '76 Chestnut Dr, Calgary, AB', 'SSN-M-021'),
('Nancy',    'Harris',    '87 Linden Rd, Halifax, NS',   'SSN-M-022'),
('Matthew',  'Sanchez',   '98 Redwood Blvd, Quebec, QC', 'SSN-M-023'),
('Lisa',     'Clark',     '19 Palmetto Ln, Winnipeg, MB','SSN-M-024'),
-- IHG managers (will manage hotels 25-32)
('Anthony',  'Ramirez',   '30 Dogwood Way, Ottawa, ON',  'SSN-M-025'),
('Betty',    'Lewis',     '41 Bamboo Ct, Toronto, ON',   'SSN-M-026'),
('Mark',     'Robinson',  '52 Beech Ave, Montreal, QC',  'SSN-M-027'),
('Dorothy',  'Walker',    '63 Cottonwood St, Vancouver, BC','SSN-M-028'),
('Donald',   'Young',     '74 Tamarack Dr, Calgary, AB', 'SSN-M-029'),
('Sandra',   'Allen',     '85 Hickory Rd, Halifax, NS',  'SSN-M-030'),
('Kenneth',  'King',      '96 Sycamore Blvd, Quebec, QC','SSN-M-031'),
('Ashley',   'Wright',    '17 Alder Ln, Winnipeg, MB',   'SSN-M-032'),
-- Wyndham managers (will manage hotels 33-40)
('Paul',     'Scott',     '28 Olive Way, Ottawa, ON',    'SSN-M-033'),
('Emily',    'Torres',    '39 Plum Ct, Toronto, ON',     'SSN-M-034'),
('Steven',   'Nguyen',    '50 Fir Ave, Montreal, QC',    'SSN-M-035'),
('Donna',    'Hill',      '61 Gum St, Vancouver, BC',    'SSN-M-036'),
('Edward',   'Flores',    '72 Teak Dr, Calgary, AB',     'SSN-M-037'),
('Melissa',  'Green',     '83 Ebony Rd, Halifax, NS',    'SSN-M-038'),
('Ronald',   'Adams',     '94 Balsa Blvd, Quebec, QC',   'SSN-M-039'),
('Carol',    'Nelson',    '15 Maple Ln, Winnipeg, MB',   'SSN-M-040');
-- employeeIDs: 1-40

-- =============================================================
-- STAGE C — Hotels (8 per chain, 3+ star categories each)
-- Star distribution per chain: hotels 1-2 = 3★, 3-5 = 4★, 6-8 = 5★
-- Address format: "Street, City, Province"
-- =============================================================
INSERT INTO Hotel (hotelName, address, starCount, email, chainID, managerID) VALUES
-- Marriott chain (chainID=1), managers 1-8
('Marriott Ottawa Centre',     '100 Kent St, Ottawa, ON',         3, 'ottawa@marriott.com',    1, 1),
('Marriott Toronto Airport',   '901 Dixon Rd, Toronto, ON',       3, 'toronto-ap@marriott.com',1, 2),
('Marriott Montreal Downtown', '1255 Jeanne-Mance, Montreal, QC', 4, 'montreal@marriott.com',  1, 3),
('Marriott Vancouver Pinnacle','1128 W Hastings, Vancouver, BC',  4, 'vancouver@marriott.com', 1, 4),
('Marriott Calgary',           '110 9th Ave SW, Calgary, AB',     4, 'calgary@marriott.com',   1, 5),
('Marriott Halifax Harbourfront','1919 Upper Water, Halifax, NS', 5, 'halifax@marriott.com',   1, 6),
('Marriott Quebec City',       '850 Place d''Youville, Quebec, QC',5,'quebec@marriott.com',    1, 7),
('Marriott Winnipeg',          '2 Lombard Pl, Winnipeg, MB',      5, 'winnipeg@marriott.com',  1, 8),
-- Hilton chain (chainID=2), managers 9-16
('Hilton Ottawa',              '150 Albert St, Ottawa, ON',         3, 'ottawa@hilton.com',    2, 9),
('Hilton Toronto Downtown',    '145 Richmond St W, Toronto, ON',   3, 'toronto@hilton.com',   2, 10),
('Hilton Montreal Bonaventure','900 De la Gauchetière, Montreal, QC',4,'montreal@hilton.com', 2, 11),
('Hilton Vancouver Metrotown', '6083 McKay Ave, Vancouver, BC',    4, 'vancouver@hilton.com', 2, 12),
('Hilton Calgary Airport',     '2001 Airport Rd NE, Calgary, AB',  4, 'calgary@hilton.com',   2, 13),
('Hilton Halifax',             '1181 Hollis St, Halifax, NS',       5, 'halifax@hilton.com',   2, 14),
('Hilton Quebec',              '1100 Rene-Levesque, Quebec, QC',   5, 'quebec@hilton.com',    2, 15),
('Hilton Winnipeg',            '2 Lombard Pl, Winnipeg, MB',        5, 'winnipeg@hilton.com',  2, 16),
-- Hyatt chain (chainID=3), managers 17-24
('Hyatt Regency Ottawa',       '180 Cooper St, Ottawa, ON',        3, 'ottawa@hyatt.com',     3, 17),
('Hyatt Regency Toronto',      '370 King St W, Toronto, ON',       3, 'toronto@hyatt.com',    3, 18),
('Hyatt Regency Montreal',     '1255 Jeanne-Mance, Montreal, QC',  4, 'montreal@hyatt.com',   3, 19),
('Hyatt Regency Vancouver',    '655 Burrard St, Vancouver, BC',    4, 'vancouver@hyatt.com',  3, 20),
('Hyatt Regency Calgary',      '700 Centre St S, Calgary, AB',     4, 'calgary@hyatt.com',    3, 21),
('Hyatt Halifax',              '1990 Barrington St, Halifax, NS',  5, 'halifax@hyatt.com',    3, 22),
('Hyatt Quebec City',          '645 Grande Allée E, Quebec, QC',   5, 'quebec@hyatt.com',     3, 23),
('Hyatt Winnipeg',             '350 St Mary Ave, Winnipeg, MB',    5, 'winnipeg@hyatt.com',   3, 24),
-- IHG chain (chainID=4), managers 25-32
('Holiday Inn Ottawa',         '101 Lyon St N, Ottawa, ON',        3, 'ottawa@ihg.com',       4, 25),
('Holiday Inn Toronto',        '30 Carlton St, Toronto, ON',       3, 'toronto@ihg.com',      4, 26),
('Holiday Inn Montreal',       '999 St-Urbain, Montreal, QC',      4, 'montreal@ihg.com',     4, 27),
('Holiday Inn Vancouver',      '711 W Broadway, Vancouver, BC',    4, 'vancouver@ihg.com',    4, 28),
('Holiday Inn Calgary',        '1020 8 Ave SW, Calgary, AB',       4, 'calgary@ihg.com',      4, 29),
('Holiday Inn Halifax',        '980 Mumford Rd, Halifax, NS',      5, 'halifax@ihg.com',      4, 30),
('Holiday Inn Quebec',         '395 De la Couronne, Quebec, QC',   5, 'quebec@ihg.com',       4, 31),
('Holiday Inn Winnipeg',       '1330 Pembina Hwy, Winnipeg, MB',   5, 'winnipeg@ihg.com',     4, 32),
-- Wyndham chain (chainID=5), managers 33-40
('Wyndham Ottawa',             '200 Slater St, Ottawa, ON',        3, 'ottawa@wyndham.com',   5, 33),
('Wyndham Toronto',            '90 Harbour St, Toronto, ON',       3, 'toronto@wyndham.com',  5, 34),
('Wyndham Montreal',           '3625 Ave du Parc, Montreal, QC',   4, 'montreal@wyndham.com', 5, 35),
('Wyndham Vancouver',          '400 Robson St, Vancouver, BC',     4, 'vancouver@wyndham.com',5, 36),
('Wyndham Calgary',            '320 4 Ave SW, Calgary, AB',        4, 'calgary@wyndham.com',  5, 37),
('Wyndham Halifax',            '1500 Argyle St, Halifax, NS',      5, 'halifax@wyndham.com',  5, 38),
('Wyndham Quebec',             '500 Grande Allée, Quebec, QC',     5, 'quebec@wyndham.com',   5, 39),
('Wyndham Winnipeg',           '2520 Portage Ave, Winnipeg, MB',   5, 'winnipeg@wyndham.com', 5, 40);
-- hotelIDs: 1-40

-- =============================================================
-- STAGE D — Update managers with their hotelID
-- =============================================================
UPDATE Employee SET hotelID = 1  WHERE employeeID = 1;
UPDATE Employee SET hotelID = 2  WHERE employeeID = 2;
UPDATE Employee SET hotelID = 3  WHERE employeeID = 3;
UPDATE Employee SET hotelID = 4  WHERE employeeID = 4;
UPDATE Employee SET hotelID = 5  WHERE employeeID = 5;
UPDATE Employee SET hotelID = 6  WHERE employeeID = 6;
UPDATE Employee SET hotelID = 7  WHERE employeeID = 7;
UPDATE Employee SET hotelID = 8  WHERE employeeID = 8;
UPDATE Employee SET hotelID = 9  WHERE employeeID = 9;
UPDATE Employee SET hotelID = 10 WHERE employeeID = 10;
UPDATE Employee SET hotelID = 11 WHERE employeeID = 11;
UPDATE Employee SET hotelID = 12 WHERE employeeID = 12;
UPDATE Employee SET hotelID = 13 WHERE employeeID = 13;
UPDATE Employee SET hotelID = 14 WHERE employeeID = 14;
UPDATE Employee SET hotelID = 15 WHERE employeeID = 15;
UPDATE Employee SET hotelID = 16 WHERE employeeID = 16;
UPDATE Employee SET hotelID = 17 WHERE employeeID = 17;
UPDATE Employee SET hotelID = 18 WHERE employeeID = 18;
UPDATE Employee SET hotelID = 19 WHERE employeeID = 19;
UPDATE Employee SET hotelID = 20 WHERE employeeID = 20;
UPDATE Employee SET hotelID = 21 WHERE employeeID = 21;
UPDATE Employee SET hotelID = 22 WHERE employeeID = 22;
UPDATE Employee SET hotelID = 23 WHERE employeeID = 23;
UPDATE Employee SET hotelID = 24 WHERE employeeID = 24;
UPDATE Employee SET hotelID = 25 WHERE employeeID = 25;
UPDATE Employee SET hotelID = 26 WHERE employeeID = 26;
UPDATE Employee SET hotelID = 27 WHERE employeeID = 27;
UPDATE Employee SET hotelID = 28 WHERE employeeID = 28;
UPDATE Employee SET hotelID = 29 WHERE employeeID = 29;
UPDATE Employee SET hotelID = 30 WHERE employeeID = 30;
UPDATE Employee SET hotelID = 31 WHERE employeeID = 31;
UPDATE Employee SET hotelID = 32 WHERE employeeID = 32;
UPDATE Employee SET hotelID = 33 WHERE employeeID = 33;
UPDATE Employee SET hotelID = 34 WHERE employeeID = 34;
UPDATE Employee SET hotelID = 35 WHERE employeeID = 35;
UPDATE Employee SET hotelID = 36 WHERE employeeID = 36;
UPDATE Employee SET hotelID = 37 WHERE employeeID = 37;
UPDATE Employee SET hotelID = 38 WHERE employeeID = 38;
UPDATE Employee SET hotelID = 39 WHERE employeeID = 39;
UPDATE Employee SET hotelID = 40 WHERE employeeID = 40;

-- =============================================================
-- STAGE E — Employee_role for all managers
-- =============================================================
INSERT INTO Employee_role (employeeID, role)
SELECT employeeID, 'Manager' FROM Employee WHERE employeeID BETWEEN 1 AND 40;

-- =============================================================
-- STAGE F — Additional Employees per hotel (Receptionist, Housekeeper)
-- 2 extra employees per hotel = 80 more employees (IDs 41-120)
-- =============================================================
INSERT INTO Employee (firstName, lastName, address, SSN, hotelID) VALUES
-- Hotel 1 (Ottawa Marriott)
('Alice',  'Chen',    '5 Main St, Ottawa, ON',    'SSN-R-001', 1),
('Bob',    'Kumar',   '7 Second St, Ottawa, ON',  'SSN-H-001', 1),
-- Hotel 2 (Toronto Marriott)
('Clara',  'Singh',   '5 Main St, Toronto, ON',   'SSN-R-002', 2),
('Derek',  'Patel',   '7 Second St, Toronto, ON', 'SSN-H-002', 2),
-- Hotel 3 (Montreal Marriott)
('Eva',    'Tremblay','5 Main St, Montreal, QC',  'SSN-R-003', 3),
('Frank',  'Bouchard','7 Second St, Montreal, QC','SSN-H-003', 3),
-- Hotel 4 (Vancouver Marriott)
('Grace',  'Lee',     '5 Main St, Vancouver, BC', 'SSN-R-004', 4),
('Henry',  'Kim',     '7 Second St, Vancouver, BC','SSN-H-004', 4),
-- Hotel 5 (Calgary Marriott)
('Irene',  'Walsh',   '5 Main St, Calgary, AB',   'SSN-R-005', 5),
('Jack',   'Murphy',  '7 Second St, Calgary, AB', 'SSN-H-005', 5),
-- Hotel 6 (Halifax Marriott)
('Karen',  'MacDonald','5 Main St, Halifax, NS',  'SSN-R-006', 6),
('Leo',    'Campbell','7 Second St, Halifax, NS', 'SSN-H-006', 6),
-- Hotel 7 (Quebec Marriott)
('Mia',    'Lavoie',  '5 Main St, Quebec, QC',    'SSN-R-007', 7),
('Noah',   'Gagne',   '7 Second St, Quebec, QC',  'SSN-H-007', 7),
-- Hotel 8 (Winnipeg Marriott)
('Olivia', 'Friesen', '5 Main St, Winnipeg, MB',  'SSN-R-008', 8),
('Peter',  'Dyck',    '7 Second St, Winnipeg, MB','SSN-H-008', 8),
-- Hotel 9 (Ottawa Hilton)
('Quinn',  'Burke',   '5 Main St, Ottawa, ON',    'SSN-R-009', 9),
('Rachel', 'Flynn',   '7 Second St, Ottawa, ON',  'SSN-H-009', 9),
-- Hotel 10 (Toronto Hilton)
('Sam',    'OBrien',  '5 Main St, Toronto, ON',   'SSN-R-010', 10),
('Tina',   'Ryan',    '7 Second St, Toronto, ON', 'SSN-H-010', 10),
-- Hotel 11 (Montreal Hilton)
('Uma',    'Cote',    '5 Main St, Montreal, QC',  'SSN-R-011', 11),
('Victor', 'Roy',     '7 Second St, Montreal, QC','SSN-H-011', 11),
-- Hotel 12 (Vancouver Hilton)
('Wendy',  'Lam',     '5 Main St, Vancouver, BC', 'SSN-R-012', 12),
('Xavier', 'Ng',      '7 Second St, Vancouver, BC','SSN-H-012', 12),
-- Hotel 13 (Calgary Hilton)
('Yara',   'Olson',   '5 Main St, Calgary, AB',   'SSN-R-013', 13),
('Zack',   'Nelson',  '7 Second St, Calgary, AB', 'SSN-H-013', 13),
-- Hotel 14 (Halifax Hilton)
('Anna',   'Steele',  '5 Main St, Halifax, NS',   'SSN-R-014', 14),
('Ben',    'Ross',    '7 Second St, Halifax, NS',  'SSN-H-014', 14),
-- Hotel 15 (Quebec Hilton)
('Cara',   'Dube',    '5 Main St, Quebec, QC',    'SSN-R-015', 15),
('Dan',    'Pelletier','7 Second St, Quebec, QC', 'SSN-H-015', 15),
-- Hotel 16 (Winnipeg Hilton)
('Eve',    'Penner',  '5 Main St, Winnipeg, MB',  'SSN-R-016', 16),
('Fred',   'Klassen', '7 Second St, Winnipeg, MB','SSN-H-016', 16),
-- Hotel 17 (Ottawa Hyatt)
('Gina',   'McLeod',  '5 Main St, Ottawa, ON',    'SSN-R-017', 17),
('Hal',    'Stewart', '7 Second St, Ottawa, ON',  'SSN-H-017', 17),
-- Hotel 18 (Toronto Hyatt)
('Isla',   'Watson',  '5 Main St, Toronto, ON',   'SSN-R-018', 18),
('Jake',   'Brooks',  '7 Second St, Toronto, ON', 'SSN-H-018', 18),
-- Hotel 19 (Montreal Hyatt)
('Kylie',  'Girard',  '5 Main St, Montreal, QC',  'SSN-R-019', 19),
('Liam',   'Fortier', '7 Second St, Montreal, QC','SSN-H-019', 19),
-- Hotel 20 (Vancouver Hyatt)
('Maya',   'Wong',    '5 Main St, Vancouver, BC', 'SSN-R-020', 20),
('Nate',   'Chu',     '7 Second St, Vancouver, BC','SSN-H-020', 20),
-- Hotel 21 (Calgary Hyatt)
('Ora',    'Dean',    '5 Main St, Calgary, AB',   'SSN-R-021', 21),
('Phil',   'Burns',   '7 Second St, Calgary, AB', 'SSN-H-021', 21),
-- Hotel 22 (Halifax Hyatt)
('Rita',   'Grant',   '5 Main St, Halifax, NS',   'SSN-R-022', 22),
('Sean',   'Webb',    '7 Second St, Halifax, NS',  'SSN-H-022', 22),
-- Hotel 23 (Quebec Hyatt)
('Tara',   'Morin',   '5 Main St, Quebec, QC',    'SSN-R-023', 23),
('Ugo',    'Lepage',  '7 Second St, Quebec, QC',  'SSN-H-023', 23),
-- Hotel 24 (Winnipeg Hyatt)
('Vera',   'Braun',   '5 Main St, Winnipeg, MB',  'SSN-R-024', 24),
('Will',   'Wiebe',   '7 Second St, Winnipeg, MB','SSN-H-024', 24),
-- Hotel 25 (Ottawa IHG)
('Xena',   'Doyle',   '5 Main St, Ottawa, ON',    'SSN-R-025', 25),
('Yogi',   'Kelley',  '7 Second St, Ottawa, ON',  'SSN-H-025', 25),
-- Hotel 26 (Toronto IHG)
('Zoe',    'Dunn',    '5 Main St, Toronto, ON',   'SSN-R-026', 26),
('Adam',   'Fox',     '7 Second St, Toronto, ON', 'SSN-H-026', 26),
-- Hotel 27 (Montreal IHG)
('Beth',   'Bélanger','5 Main St, Montreal, QC',  'SSN-R-027', 27),
('Cole',   'Lessard', '7 Second St, Montreal, QC','SSN-H-027', 27),
-- Hotel 28 (Vancouver IHG)
('Dana',   'Tran',    '5 Main St, Vancouver, BC', 'SSN-R-028', 28),
('Eli',    'Ho',      '7 Second St, Vancouver, BC','SSN-H-028', 28),
-- Hotel 29 (Calgary IHG)
('Faye',   'Bird',    '5 Main St, Calgary, AB',   'SSN-R-029', 29),
('Glen',   'Fox',     '7 Second St, Calgary, AB', 'SSN-H-029', 29),
-- Hotel 30 (Halifax IHG)
('Hope',   'Lord',    '5 Main St, Halifax, NS',   'SSN-R-030', 30),
('Ian',    'Snow',    '7 Second St, Halifax, NS',  'SSN-H-030', 30),
-- Hotel 31 (Quebec IHG)
('Joan',   'Parent',  '5 Main St, Quebec, QC',    'SSN-R-031', 31),
('Karl',   'Poirier', '7 Second St, Quebec, QC',  'SSN-H-031', 31),
-- Hotel 32 (Winnipeg IHG)
('Laura',  'Janzen',  '5 Main St, Winnipeg, MB',  'SSN-R-032', 32),
('Mike',   'Peters',  '7 Second St, Winnipeg, MB','SSN-H-032', 32),
-- Hotel 33 (Ottawa Wyndham)
('Nina',   'Carr',    '5 Main St, Ottawa, ON',    'SSN-R-033', 33),
('Owen',   'Ball',    '7 Second St, Ottawa, ON',  'SSN-H-033', 33),
-- Hotel 34 (Toronto Wyndham)
('Pam',    'Day',     '5 Main St, Toronto, ON',   'SSN-R-034', 34),
('Quentin','Hay',     '7 Second St, Toronto, ON', 'SSN-H-034', 34),
-- Hotel 35 (Montreal Wyndham)
('Rose',   'Pageau',  '5 Main St, Montreal, QC',  'SSN-R-035', 35),
('Scott',  'Bisson',  '7 Second St, Montreal, QC','SSN-H-035', 35),
-- Hotel 36 (Vancouver Wyndham)
('Tess',   'Yuen',    '5 Main St, Vancouver, BC', 'SSN-R-036', 36),
('Uri',    'Leung',   '7 Second St, Vancouver, BC','SSN-H-036', 36),
-- Hotel 37 (Calgary Wyndham)
('Viv',    'Amos',    '5 Main St, Calgary, AB',   'SSN-R-037', 37),
('Wade',   'Cain',    '7 Second St, Calgary, AB', 'SSN-H-037', 37),
-- Hotel 38 (Halifax Wyndham)
('Xia',    'Hart',    '5 Main St, Halifax, NS',   'SSN-R-038', 38),
('Yael',   'Holt',    '7 Second St, Halifax, NS',  'SSN-H-038', 38),
-- Hotel 39 (Quebec Wyndham)
('Zara',   'Cyr',     '5 Main St, Quebec, QC',    'SSN-R-039', 39),
('Abel',   'Michaud', '7 Second St, Quebec, QC',  'SSN-H-039', 39),
-- Hotel 40 (Winnipeg Wyndham)
('Bea',    'Reimer',  '5 Main St, Winnipeg, MB',  'SSN-R-040', 40),
('Carl',   'Unruh',   '7 Second St, Winnipeg, MB','SSN-H-040', 40);

-- Assign roles to additional employees
INSERT INTO Employee_role (employeeID, role)
SELECT e.employeeID,
       CASE WHEN e.SSN LIKE 'SSN-R-%' THEN 'Receptionist' ELSE 'Housekeeper' END
FROM Employee e WHERE e.employeeID > 40;

-- =============================================================
-- STAGE G — Rooms (5 per hotel = 200 rooms total)
-- Capacity 1-4 varied; pricing by star rating;
-- viewType alternates Sea/Mountain; extendability alternates.
-- roomCount is managed by trigger trg_sync_room_count.
-- =============================================================

-- Helper: rooms for 3-star hotels (price $80-150)
-- Hotels 1,2  (Marriott Ottawa, Toronto)
INSERT INTO Room (hotelID, price, capacity, viewType, extendability) VALUES
(1,  90.00, 1, 'Mountain', FALSE),
(1, 105.00, 2, 'Sea',      TRUE),
(1, 120.00, 2, 'Mountain', FALSE),
(1, 135.00, 3, 'Sea',      TRUE),
(1, 150.00, 4, NULL,       FALSE),

(2,  90.00, 1, 'Sea',      FALSE),
(2, 105.00, 2, 'Mountain', TRUE),
(2, 120.00, 2, 'Sea',      FALSE),
(2, 135.00, 3, 'Mountain', TRUE),
(2, 150.00, 4, NULL,       FALSE),

-- Hotels 9,10 (Hilton Ottawa, Toronto) — 3-star
(9,  85.00, 1, 'Mountain', FALSE),
(9, 100.00, 2, 'Sea',      TRUE),
(9, 115.00, 2, 'Mountain', FALSE),
(9, 130.00, 3, 'Sea',      TRUE),
(9, 145.00, 4, NULL,       FALSE),

(10,  85.00, 1, 'Sea',      FALSE),
(10, 100.00, 2, 'Mountain', TRUE),
(10, 115.00, 2, 'Sea',      FALSE),
(10, 130.00, 3, 'Mountain', TRUE),
(10, 145.00, 4, NULL,       FALSE),

-- Hotels 17,18 (Hyatt Ottawa, Toronto) — 3-star
(17,  80.00, 1, 'Mountain', FALSE),
(17,  95.00, 2, 'Sea',      TRUE),
(17, 110.00, 2, 'Mountain', FALSE),
(17, 125.00, 3, 'Sea',      TRUE),
(17, 140.00, 4, NULL,       FALSE),

(18,  80.00, 1, 'Sea',      FALSE),
(18,  95.00, 2, 'Mountain', TRUE),
(18, 110.00, 2, 'Sea',      FALSE),
(18, 125.00, 3, 'Mountain', TRUE),
(18, 140.00, 4, NULL,       FALSE),

-- Hotels 25,26 (IHG Ottawa, Toronto) — 3-star
(25,  88.00, 1, 'Mountain', FALSE),
(25, 103.00, 2, 'Sea',      TRUE),
(25, 118.00, 2, 'Mountain', FALSE),
(25, 133.00, 3, 'Sea',      TRUE),
(25, 148.00, 4, NULL,       FALSE),

(26,  88.00, 1, 'Sea',      FALSE),
(26, 103.00, 2, 'Mountain', TRUE),
(26, 118.00, 2, 'Sea',      FALSE),
(26, 133.00, 3, 'Mountain', TRUE),
(26, 148.00, 4, NULL,       FALSE),

-- Hotels 33,34 (Wyndham Ottawa, Toronto) — 3-star
(33,  82.00, 1, 'Mountain', FALSE),
(33,  97.00, 2, 'Sea',      TRUE),
(33, 112.00, 2, 'Mountain', FALSE),
(33, 127.00, 3, 'Sea',      TRUE),
(33, 142.00, 4, NULL,       FALSE),

(34,  82.00, 1, 'Sea',      FALSE),
(34,  97.00, 2, 'Mountain', TRUE),
(34, 112.00, 2, 'Sea',      FALSE),
(34, 127.00, 3, 'Mountain', TRUE),
(34, 142.00, 4, NULL,       FALSE);

-- 4-star hotels (price $150-250)
-- Hotels 3,4,5 (Marriott Montreal, Vancouver, Calgary)
INSERT INTO Room (hotelID, price, capacity, viewType, extendability) VALUES
(3, 160.00, 1, 'Mountain', FALSE),
(3, 185.00, 2, 'Sea',      TRUE),
(3, 205.00, 2, 'Mountain', FALSE),
(3, 225.00, 3, 'Sea',      TRUE),
(3, 245.00, 4, NULL,       FALSE),

(4, 165.00, 1, 'Sea',      FALSE),
(4, 190.00, 2, 'Mountain', TRUE),
(4, 210.00, 2, 'Sea',      FALSE),
(4, 230.00, 3, 'Mountain', TRUE),
(4, 250.00, 4, NULL,       FALSE),

(5, 155.00, 1, 'Mountain', FALSE),
(5, 180.00, 2, 'Sea',      TRUE),
(5, 200.00, 2, 'Mountain', FALSE),
(5, 220.00, 3, 'Sea',      TRUE),
(5, 240.00, 4, NULL,       FALSE),

-- Hotels 11,12,13 (Hilton Montreal, Vancouver, Calgary)
(11, 160.00, 1, 'Mountain', FALSE),
(11, 185.00, 2, 'Sea',      TRUE),
(11, 205.00, 2, 'Mountain', FALSE),
(11, 225.00, 3, 'Sea',      TRUE),
(11, 245.00, 4, NULL,       FALSE),

(12, 165.00, 1, 'Sea',      FALSE),
(12, 190.00, 2, 'Mountain', TRUE),
(12, 210.00, 2, 'Sea',      FALSE),
(12, 230.00, 3, 'Mountain', TRUE),
(12, 250.00, 4, NULL,       FALSE),

(13, 155.00, 1, 'Mountain', FALSE),
(13, 180.00, 2, 'Sea',      TRUE),
(13, 200.00, 2, 'Mountain', FALSE),
(13, 220.00, 3, 'Sea',      TRUE),
(13, 240.00, 4, NULL,       FALSE),

-- Hotels 19,20,21 (Hyatt Montreal, Vancouver, Calgary)
(19, 158.00, 1, 'Mountain', FALSE),
(19, 183.00, 2, 'Sea',      TRUE),
(19, 203.00, 2, 'Mountain', FALSE),
(19, 223.00, 3, 'Sea',      TRUE),
(19, 243.00, 4, NULL,       FALSE),

(20, 163.00, 1, 'Sea',      FALSE),
(20, 188.00, 2, 'Mountain', TRUE),
(20, 208.00, 2, 'Sea',      FALSE),
(20, 228.00, 3, 'Mountain', TRUE),
(20, 248.00, 4, NULL,       FALSE),

(21, 153.00, 1, 'Mountain', FALSE),
(21, 178.00, 2, 'Sea',      TRUE),
(21, 198.00, 2, 'Mountain', FALSE),
(21, 218.00, 3, 'Sea',      TRUE),
(21, 238.00, 4, NULL,       FALSE),

-- Hotels 27,28,29 (IHG Montreal, Vancouver, Calgary)
(27, 162.00, 1, 'Mountain', FALSE),
(27, 187.00, 2, 'Sea',      TRUE),
(27, 207.00, 2, 'Mountain', FALSE),
(27, 227.00, 3, 'Sea',      TRUE),
(27, 247.00, 4, NULL,       FALSE),

(28, 167.00, 1, 'Sea',      FALSE),
(28, 192.00, 2, 'Mountain', TRUE),
(28, 212.00, 2, 'Sea',      FALSE),
(28, 232.00, 3, 'Mountain', TRUE),
(28, 252.00, 4, NULL,       FALSE),

(29, 157.00, 1, 'Mountain', FALSE),
(29, 182.00, 2, 'Sea',      TRUE),
(29, 202.00, 2, 'Mountain', FALSE),
(29, 222.00, 3, 'Sea',      TRUE),
(29, 242.00, 4, NULL,       FALSE),

-- Hotels 35,36,37 (Wyndham Montreal, Vancouver, Calgary)
(35, 156.00, 1, 'Mountain', FALSE),
(35, 181.00, 2, 'Sea',      TRUE),
(35, 201.00, 2, 'Mountain', FALSE),
(35, 221.00, 3, 'Sea',      TRUE),
(35, 241.00, 4, NULL,       FALSE),

(36, 161.00, 1, 'Sea',      FALSE),
(36, 186.00, 2, 'Mountain', TRUE),
(36, 206.00, 2, 'Sea',      FALSE),
(36, 226.00, 3, 'Mountain', TRUE),
(36, 246.00, 4, NULL,       FALSE),

(37, 151.00, 1, 'Mountain', FALSE),
(37, 176.00, 2, 'Sea',      TRUE),
(37, 196.00, 2, 'Mountain', FALSE),
(37, 216.00, 3, 'Sea',      TRUE),
(37, 236.00, 4, NULL,       FALSE);

-- 5-star hotels (price $250-400)
-- Hotels 6,7,8 (Marriott Halifax, Quebec, Winnipeg)
INSERT INTO Room (hotelID, price, capacity, viewType, extendability) VALUES
(6, 260.00, 1, 'Sea',      FALSE),
(6, 300.00, 2, 'Mountain', TRUE),
(6, 330.00, 2, 'Sea',      FALSE),
(6, 365.00, 3, 'Mountain', TRUE),
(6, 395.00, 4, NULL,       FALSE),

(7, 255.00, 1, 'Mountain', FALSE),
(7, 295.00, 2, 'Sea',      TRUE),
(7, 325.00, 2, 'Mountain', FALSE),
(7, 360.00, 3, 'Sea',      TRUE),
(7, 390.00, 4, NULL,       FALSE),

(8, 265.00, 1, 'Sea',      FALSE),
(8, 305.00, 2, 'Mountain', TRUE),
(8, 335.00, 2, 'Sea',      FALSE),
(8, 370.00, 3, 'Mountain', TRUE),
(8, 400.00, 4, NULL,       FALSE),

-- Hotels 14,15,16 (Hilton Halifax, Quebec, Winnipeg)
(14, 260.00, 1, 'Sea',      FALSE),
(14, 300.00, 2, 'Mountain', TRUE),
(14, 330.00, 2, 'Sea',      FALSE),
(14, 365.00, 3, 'Mountain', TRUE),
(14, 395.00, 4, NULL,       FALSE),

(15, 255.00, 1, 'Mountain', FALSE),
(15, 295.00, 2, 'Sea',      TRUE),
(15, 325.00, 2, 'Mountain', FALSE),
(15, 360.00, 3, 'Sea',      TRUE),
(15, 390.00, 4, NULL,       FALSE),

(16, 265.00, 1, 'Sea',      FALSE),
(16, 305.00, 2, 'Mountain', TRUE),
(16, 335.00, 2, 'Sea',      FALSE),
(16, 370.00, 3, 'Mountain', TRUE),
(16, 400.00, 4, NULL,       FALSE),

-- Hotels 22,23,24 (Hyatt Halifax, Quebec, Winnipeg)
(22, 258.00, 1, 'Sea',      FALSE),
(22, 298.00, 2, 'Mountain', TRUE),
(22, 328.00, 2, 'Sea',      FALSE),
(22, 363.00, 3, 'Mountain', TRUE),
(22, 393.00, 4, NULL,       FALSE),

(23, 253.00, 1, 'Mountain', FALSE),
(23, 293.00, 2, 'Sea',      TRUE),
(23, 323.00, 2, 'Mountain', FALSE),
(23, 358.00, 3, 'Sea',      TRUE),
(23, 388.00, 4, NULL,       FALSE),

(24, 263.00, 1, 'Sea',      FALSE),
(24, 303.00, 2, 'Mountain', TRUE),
(24, 333.00, 2, 'Sea',      FALSE),
(24, 368.00, 3, 'Mountain', TRUE),
(24, 398.00, 4, NULL,       FALSE),

-- Hotels 30,31,32 (IHG Halifax, Quebec, Winnipeg)
(30, 262.00, 1, 'Sea',      FALSE),
(30, 302.00, 2, 'Mountain', TRUE),
(30, 332.00, 2, 'Sea',      FALSE),
(30, 367.00, 3, 'Mountain', TRUE),
(30, 397.00, 4, NULL,       FALSE),

(31, 257.00, 1, 'Mountain', FALSE),
(31, 297.00, 2, 'Sea',      TRUE),
(31, 327.00, 2, 'Mountain', FALSE),
(31, 362.00, 3, 'Sea',      TRUE),
(31, 392.00, 4, NULL,       FALSE),

(32, 267.00, 1, 'Sea',      FALSE),
(32, 307.00, 2, 'Mountain', TRUE),
(32, 337.00, 2, 'Sea',      FALSE),
(32, 372.00, 3, 'Mountain', TRUE),
(32, 402.00, 4, NULL,       FALSE),

-- Hotels 38,39,40 (Wyndham Halifax, Quebec, Winnipeg)
(38, 256.00, 1, 'Sea',      FALSE),
(38, 296.00, 2, 'Mountain', TRUE),
(38, 326.00, 2, 'Sea',      FALSE),
(38, 361.00, 3, 'Mountain', TRUE),
(38, 391.00, 4, NULL,       FALSE),

(39, 251.00, 1, 'Mountain', FALSE),
(39, 291.00, 2, 'Sea',      TRUE),
(39, 321.00, 2, 'Mountain', FALSE),
(39, 356.00, 3, 'Sea',      TRUE),
(39, 386.00, 4, NULL,       FALSE),

(40, 261.00, 1, 'Sea',      FALSE),
(40, 301.00, 2, 'Mountain', TRUE),
(40, 331.00, 2, 'Sea',      FALSE),
(40, 366.00, 3, 'Mountain', TRUE),
(40, 396.00, 4, NULL,       FALSE);

-- =============================================================
-- STAGE H — Room amenities and damages (sample subset)
-- =============================================================
-- Amenities for first few rooms of each hotel cluster
INSERT INTO Room_amenity (roomID, amenityName) VALUES
-- Rooms 1-5 (Hotel 1 Ottawa Marriott)
(1, 'WiFi'), (1, 'TV'),
(2, 'WiFi'), (2, 'TV'), (2, 'Air Conditioning'),
(3, 'WiFi'), (3, 'TV'), (3, 'Air Conditioning'), (3, 'Coffee Maker'),
(4, 'WiFi'), (4, 'TV'), (4, 'Air Conditioning'), (4, 'Mini Bar'),
(5, 'WiFi'), (5, 'TV'), (5, 'Air Conditioning'), (5, 'Mini Bar'), (5, 'Jacuzzi'),
-- Rooms 6-10 (Hotel 2 Toronto Marriott)
(6, 'WiFi'), (6, 'TV'),
(7, 'WiFi'), (7, 'TV'), (7, 'Air Conditioning'),
(8, 'WiFi'), (8, 'TV'), (8, 'Air Conditioning'), (8, 'Coffee Maker'),
(9, 'WiFi'), (9, 'TV'), (9, 'Air Conditioning'), (9, 'Mini Bar'),
(10, 'WiFi'), (10, 'TV'), (10, 'Air Conditioning'), (10, 'Mini Bar'), (10, 'Safe');

-- Add WiFi to all remaining rooms (WiFi is universal)
INSERT INTO Room_amenity (roomID, amenityName)
SELECT r.roomID, 'WiFi'
FROM Room r
WHERE r.roomID > 10
  AND NOT EXISTS (
      SELECT 1 FROM Room_amenity ra WHERE ra.roomID = r.roomID AND ra.amenityName = 'WiFi'
  );

-- Add TV to all remaining rooms
INSERT INTO Room_amenity (roomID, amenityName)
SELECT r.roomID, 'TV'
FROM Room r
WHERE r.roomID > 10
  AND NOT EXISTS (
      SELECT 1 FROM Room_amenity ra WHERE ra.roomID = r.roomID AND ra.amenityName = 'TV'
  );

-- Sample damages on a few rooms
INSERT INTO Room_damage (roomID, damageName) VALUES
(3, 'Small stain on carpet'),
(7, 'Scratch on desk surface'),
(15, 'Cracked bathroom tile');

-- =============================================================
-- STAGE I — Contact information
-- =============================================================
INSERT INTO HotelChain_phoneNumber (chainID, phoneNumber) VALUES
(1, '1-800-228-9290'),
(2, '1-800-445-8667'),
(3, '1-800-633-7313'),
(4, '1-877-424-2449'),
(5, '1-800-466-1589');

INSERT INTO HotelChain_emailAddress (chainID, emailAddress) VALUES
(1, 'corporate@marriott.com'),
(2, 'corporate@hilton.com'),
(3, 'corporate@hyatt.com'),
(4, 'corporate@ihg.com'),
(5, 'corporate@wyndham.com');

INSERT INTO Hotel_phoneNumber (hotelID, phoneNumber) VALUES
(1, '613-238-1122'), (2, '416-675-0144'),
(3, '514-285-1450'), (4, '604-684-1128'),
(5, '403-266-7331'), (6, '902-421-1700'),
(7, '418-647-2411'), (8, '204-985-6700'),
(9, '613-236-0301'), (10, '416-869-3456'),
(11, '514-878-2332'), (12, '604-438-1200'),
(13, '403-230-1999'), (14, '902-422-1301'),
(15, '418-647-2411'), (16, '204-942-0551'),
(17, '613-780-1234'), (18, '416-343-1234'),
(19, '514-982-1234'), (20, '604-683-1234'),
(21, '403-717-1234'), (22, '902-444-1234'),
(23, '418-694-1234'), (24, '204-594-1234'),
(25, '613-567-1234'), (26, '416-977-1234'),
(27, '514-842-1234'), (28, '604-734-1234'),
(29, '403-263-1234'), (30, '902-455-1234'),
(31, '418-523-1234'), (32, '204-888-1234'),
(33, '613-722-1234'), (34, '416-203-1234'),
(35, '514-272-1234'), (36, '604-428-1234'),
(37, '403-541-1234'), (38, '902-446-1234'),
(39, '418-681-1234'), (40, '204-885-1234');

-- =============================================================
-- STAGE J — Customers (25 sample customers)
-- =============================================================
INSERT INTO Customer (firstName, lastName, address, idType, idNumber) VALUES
('Alice',    'Wong',      '10 Queen St, Ottawa, ON',     'SIN',             'SIN-101-001'),
('Brian',    'Smith',     '22 King Rd, Toronto, ON',     'SSN',             'SSN-201-001'),
('Chloé',   'Dubois',    '15 Rue St-Denis, Montreal, QC','SIN',             'SIN-301-001'),
('Daniel',   'Park',      '88 Robson St, Vancouver, BC', 'Driving Licence', 'DL-401-001'),
('Emma',     'Johnson',   '55 8 Ave SW, Calgary, AB',    'SIN',             'SIN-501-001'),
('François', 'Tremblay',  '30 Argyle St, Halifax, NS',   'SSN',             'SSN-601-001'),
('Gina',     'Lapointe',  '200 Côte d''Abraham, Quebec, QC','SIN',           'SIN-701-001'),
('Henry',    'Olson',     '400 Portage Ave, Winnipeg, MB','Driving Licence', 'DL-801-001'),
('Isabella', 'Rossi',     '12 Elgin St, Ottawa, ON',     'Driving Licence', 'DL-102-001'),
('James',    'MacDonald', '99 Yonge St, Toronto, ON',    'SIN',             'SIN-202-001'),
('Kate',     'Lavoie',    '55 Ste-Catherine, Montreal, QC','SIN',            'SIN-302-001'),
('Liam',     'Suzuki',    '200 Granville St, Vancouver, BC','Driving Licence','DL-402-001'),
('Maria',    'Nguyen',    '77 Centre St, Calgary, AB',   'SIN',             'SIN-502-001'),
('Nadia',    'Murray',    '5 Spring Garden, Halifax, NS', 'SSN',             'SSN-602-001'),
('Oscar',    'Gervais',   '100 St-Jean, Quebec, QC',     'SIN',             'SIN-702-001'),
('Paula',    'Friesen',   '1 Broadway, Winnipeg, MB',    'Driving Licence', 'DL-802-001'),
('Quinn',    'Zhang',     '3 Laurier Ave, Ottawa, ON',   'SIN',             'SIN-103-001'),
('Rachel',   'Brown',     '50 Front St, Toronto, ON',    'SSN',             'SSN-203-001'),
('Sébastien','Martin',    '8 Peel St, Montreal, QC',     'SIN',             'SIN-303-001'),
('Tina',     'Chen',      '300 Burrard St, Vancouver, BC','Driving Licence', 'DL-403-001'),
('Umar',     'Ali',       '200 Macleod Trail, Calgary, AB','SIN',            'SIN-503-001'),
('Victoria', 'Walsh',     '100 Barrington, Halifax, NS', 'SSN',             'SSN-603-001'),
('William',  'Côté',      '50 René-Lévesque, Quebec, QC','SIN',             'SIN-703-001'),
('Xena',     'Peters',    '500 St Mary Ave, Winnipeg, MB','Driving Licence', 'DL-803-001'),
('Yusuf',    'Hassan',    '20 Wellington St, Ottawa, ON','Driving Licence', 'DL-104-001');

-- =============================================================
-- STAGE K — Sample Bookings and Rentings
-- =============================================================

-- Active bookings (future dates)
INSERT INTO Booking (startDate, endDate, roomID, customerID) VALUES
('2026-04-10', '2026-04-13', 1,  1),   -- Alice at Ottawa Marriott room 1
('2026-04-15', '2026-04-18', 6,  2),   -- Brian at Toronto Marriott room 6
('2026-04-20', '2026-04-25', 11, 3),   -- Chloé at Montreal Marriott room 11 (4-star)
('2026-05-01', '2026-05-05', 16, 4),   -- Daniel at Vancouver Marriott room 16
('2026-05-10', '2026-05-12', 21, 5),   -- Emma at Calgary Marriott room 21
('2026-05-15', '2026-05-20', 26, 6),   -- François at Halifax Marriott room 26
('2026-06-01', '2026-06-05', 31, 7),   -- Gina at Quebec Marriott room 31
('2026-06-10', '2026-06-14', 36, 8),   -- Henry at Winnipeg Marriott room 36
('2026-06-20', '2026-06-25', 41, 9),   -- Isabella at Ottawa Hilton room 41
('2026-07-01', '2026-07-05', 46, 10);  -- James at Toronto Hilton room 46

-- Active rentings (current stays — walk-in, no booking)
INSERT INTO Renting (startDate, endDate, roomID, customerID, employeeID, paid) VALUES
('2026-04-01', '2026-04-05', 51,  11, 17, TRUE),   -- Kate walk-in at Ottawa Hyatt, processed by manager
('2026-04-01', '2026-04-07', 56,  12, 18, FALSE),  -- Liam walk-in at Toronto Hyatt
('2026-04-02', '2026-04-04', 61,  13, 19, TRUE),   -- Maria at Montreal Hyatt
('2026-04-02', '2026-04-06', 66,  14, 20, FALSE),  -- Nadia at Vancouver Hyatt
('2026-04-01', '2026-04-03', 101, 15, 25, TRUE);   -- Oscar at Ottawa IHG
