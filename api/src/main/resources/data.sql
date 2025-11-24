TRUNCATE TABLE users RESTART IDENTITY CASCADE;
TRUNCATE TABLE addresses RESTART IDENTITY CASCADE;
TRUNCATE TABLE product_types RESTART IDENTITY CASCADE;
TRUNCATE TABLE producers RESTART IDENTITY CASCADE;
TRUNCATE TABLE products RESTART IDENTITY CASCADE;
TRUNCATE TABLE reservations RESTART IDENTITY CASCADE;
TRUNCATE TABLE reservation_products RESTART IDENTITY CASCADE;
TRUNCATE TABLE units RESTART IDENTITY CASCADE;
TRUNCATE TABLE open_sales RESTART IDENTITY CASCADE;



INSERT INTO addresses (street, number, po_box, postal_code, country, city)
VALUES ( 'Rue du Terroir', '12', NULL, '1000', 'Belgique', 'Bruxelles');

-- password: Admin1-
INSERT INTO users(user_id,email, firstname, lastname, password, phone_number, title, address, registration_date, role, deactivated)
VALUES(1,'dubois.manu@gmail.be', 'Manu', 'Dubois', '$2a$06$DdFZuvPslK8.zqoH5FJ46e2P/JuIZk6pez6ol7JHyQFK4e.0.9KDG', '+32425413476', 'Mr', 1, NOW(), 'MANAGER', false);
-- password: BenevoleAccess123-
INSERT INTO users(user_id,email, firstname, lastname, password, phone_number, title, address, registration_date, role, deactivated)
VALUES(2,'volunteer@terroircie.be', 'Volunteer', 'VolunteerSurname', '$2a$06$Lt.AjY7Taf5lnxiazZl9guT8h0s5IioAvsbIFYc97oxL/d5.wowUG', '+32475362159', 'Mr', 1, NOW(), 'MANAGER', false);
-- password: Password1!
INSERT INTO users(user_id,email, firstname, lastname, password, phone_number, title, address, registration_date, role, deactivated)
VALUES(4,'droity.suzanne@gmail.be', 'Suzanne', 'Droity','$2a$10$QfvhScdq7a0MW0.bNaynLedz70ccF696E2JB7qY55HXjq8iae/ZLO', '+32456232568', 'Mr', 1, NOW(), 'CUSTOMER', false);
-- password: Password1!
INSERT INTO users (user_id,email,password,title,firstname,lastname,phone_number,address,registration_date,account_creator_manager,role,deactivated)
VALUES (3,'maerckx.roger@gmail.be','$2a$10$QfvhScdq7a0MW0.bNaynLedz70ccF696E2JB7qY55HXjq8iae/ZLO','M.','Roger','Maerckx','0425614325',1, CURRENT_TIMESTAMP,1,'PRODUCER', false);
-- password: Password1!
INSERT INTO users (user_id,email,password,title,firstname,lastname,phone_number,address,registration_date,account_creator_manager,role,deactivated)
VALUES (5,'producteur@gmail.be','$2a$10$QfvhScdq7a0MW0.bNaynLedz70ccF696E2JB7qY55HXjq8iae/ZLO','M.', 'producteur','producteur','0499123456',1,CURRENT_TIMESTAMP,1,'PRODUCER',false);


INSERT INTO producers (user_id, company_name)
VALUES (3, 'Ferme Paul & Co');
INSERT INTO producers (user_id, company_name)
VALUES (5, 'Ferme Deli');


INSERT INTO product_types (type_id, label) VALUES (1, 'Légume');
INSERT INTO product_types (type_id, label) VALUES (2, 'Fruit');
INSERT INTO product_types (type_id, label) VALUES (3, 'Autres');


Insert INTO units (unit_id, label)
VALUES (1, 'kg');
Insert INTO units (unit_id, label)
VALUES (2, 'pièce');


INSERT INTO products (description, label, unit, type)
VALUES ('Excellente laitue de printemps, d’été et d’automne verte clair, pommée, ondulée et croquante', 'Laitue Blonde de Paris', 2, 1);
INSERT INTO products (description, label, unit, type)
VALUES ('Courgette ventrue à peau vert très pâle', 'Courgette Blanche d’Egypte', 1, 1);
INSERT INTO products (description, label, unit, type)
VALUES ('Haricots extra-fins d’un beau pourpre foncé', 'Haricots Mistik', 1, 1);
INSERT INTO products (description, label, unit, type)
VALUES ('Carottes à la saveur sucrée, de couleur pourpre violet dont la chair est orangée', 'Carottes Cosmic Purple', 1, 1);
INSERT INTO products (description, label, unit, type)
VALUES ('Texture onctueuse cristallisée, arômes rappellent la richesse florale des prairies printanières', 'Miel de Pissenlit Bio 250gr', 2, 3);
INSERT INTO products (description, label, unit, type)
VALUES ('Cerise de couleur jaune marbrée de rouge, ferme et croquante', 'Cerise Napoléon', 1, 2);
INSERT INTO products (description, label, unit, type)
VALUES ('Tomates fraiches et juteuses', 'Tomate Voyage', 1, 1);
INSERT INTO products (description, label, unit, type)
VALUES ('Pommes à la chair juteuse, ferme et croquante', 'Pomme Golden', 1, 2);


INSERT INTO product_images (product, url)
VALUES (1, 'https://imagestorage024.blob.core.windows.net/dev/302bae2a-ff9a-4b47-a02e-a8f1413366be');
INSERT INTO product_images (product, url)
VALUES (2, 'https://imagestorage024.blob.core.windows.net/dev/c59a40a9-1909-4fce-85e1-2b9841dd1d1f');
INSERT INTO product_images (product, url)
VALUES (3, 'https://imagestorage024.blob.core.windows.net/dev/3b5d639e-747e-44fe-b166-e81080d05758');
INSERT INTO product_images (product, url)
VALUES (4, 'https://imagestorage024.blob.core.windows.net/dev/cc7a25bd-7e74-4bd5-8c39-8967443a63a5');
INSERT INTO product_images (product, url)
VALUES (5, 'https://imagestorage024.blob.core.windows.net/dev/6e16759f-628f-41f1-9993-a132d30cc5d9');
INSERT INTO product_images (product, url)
VALUES (6, 'https://imagestorage024.blob.core.windows.net/dev/b82d8e16-bafd-482e-b0ee-ee7d6380a1ba');
INSERT INTO product_images (product, url)
VALUES (7, 'https://imagestorage024.blob.core.windows.net/dev/db2ad887-3121-493a-95ec-26d2682e54db');
INSERT INTO product_images (product, url)
VALUES (8, 'https://imagestorage024.blob.core.windows.net/dev/3598d3c2-3387-45ef-8cd6-551f2e2f7a51');


INSERT INTO product_lots (
    product, producer, image, unit_price, initial_quantity, sold_quantity,
    remaining_quantity, reserved_quantity, removed_quantity, responsible_manager,
    proposal_date, availability_date, receipt_date, state
) VALUES (1,3,1,0.73,67,0,67,0,0,1,'2024-03-27 12:00:00','2024-03-28 08:00:00','2024-03-28 08:00:00','FOR_SALE');

INSERT INTO product_lots (
    product, producer, image, unit_price, initial_quantity, sold_quantity,
    remaining_quantity, reserved_quantity, removed_quantity, responsible_manager,
    proposal_date, availability_date, receipt_date, state
) VALUES (2,3,2,3.75,300,0,300,0,0,1,'2024-03-27 12:00:00','2024-03-28 08:00:00','2024-03-28 08:00:00','FOR_SALE');

INSERT INTO product_lots (
    product, producer, image, unit_price, initial_quantity, sold_quantity,
    remaining_quantity, reserved_quantity, removed_quantity, responsible_manager,
    proposal_date, availability_date, receipt_date, state
) VALUES (3,3,3,2.99,220,0,220,0,0,1,'2024-03-27 12:00:00','2024-03-28 08:00:00','2024-03-28 08:00:00','SOLD_OUT');

INSERT INTO product_lots (
    product, producer, image, unit_price, initial_quantity, sold_quantity,
    remaining_quantity, reserved_quantity, removed_quantity, responsible_manager,
    proposal_date, availability_date, receipt_date, state
) VALUES (4,3,4,3.22,185,0,185,0,0,1,'2024-03-27 12:00:00','2024-03-28 08:00:00','2024-03-28 08:00:00','SOLD_OUT');

INSERT INTO product_lots (
    product, producer, image, unit_price, initial_quantity, sold_quantity,
    remaining_quantity, reserved_quantity, removed_quantity, responsible_manager,
    proposal_date, availability_date, receipt_date, state
) VALUES (5,3,5,11.9,8,0,8,0,0,1,'2024-03-27 12:00:00','2024-03-28 08:00:00','2024-03-28 08:00:00','FOR_SALE');

INSERT INTO product_lots (
    product, producer, image, unit_price, initial_quantity, sold_quantity,
    remaining_quantity, reserved_quantity, removed_quantity, responsible_manager,
    proposal_date, availability_date, receipt_date, state
) VALUES (6,3,6,32,105,0,105,0,0,1,'2024-03-27 12:00:00','2024-03-28 08:00:00','2024-03-28 08:00:00','REJECTED');

INSERT INTO product_lots (
    product, producer, image, unit_price, initial_quantity, sold_quantity,
    remaining_quantity, reserved_quantity, removed_quantity, responsible_manager,
    proposal_date, availability_date, receipt_date, state
) VALUES (7,5,7,3.2,50,0,50,0,0,1,'2024-03-27 12:00:00','2024-03-28 08:00:00','2024-03-28 08:00:00','FOR_SALE');

INSERT INTO product_lots (
    product, producer, image, unit_price, initial_quantity, sold_quantity,
    remaining_quantity, reserved_quantity, removed_quantity, responsible_manager,
    proposal_date, availability_date, receipt_date, state
) VALUES (8,5,8,2.3,60,60,0,0,0,1,'2024-03-27 12:00:00','2024-03-28 08:00:00','2024-03-28 08:00:00','SOLD_OUT');

INSERT INTO product_lots (
    product, producer, image, unit_price, initial_quantity, sold_quantity,
    remaining_quantity, reserved_quantity, removed_quantity, responsible_manager,
    proposal_date, availability_date, receipt_date, state
) VALUES (8,5,8,2.3,60,40,20,0,0,1,'2025-03-27 12:00:00','2025-03-28 08:00:00','2025-03-28 08:00:00','FOR_SALE');


INSERT INTO reservations (reservation_id, customer, recovery_date, reservation_date, state)
VALUES (1, 4, '2025-05-15', '2024-06-20 11:00:00', 'RESERVED');
INSERT INTO reservations (reservation_id, customer, recovery_date, reservation_date, state)
VALUES (2, 4, '2025-05-15', '2024-06-20 11:00:00', 'RESERVED');
INSERT INTO reservations (reservation_id, customer, recovery_date, reservation_date, state)
VALUES (3, 4, '2025-05-06', '2024-06-20 11:00:00', 'RETRIEVED');
INSERT INTO reservations (reservation_id, customer, recovery_date, reservation_date, state)
VALUES (4, 4, '2025-04-29', '2024-06-20 12:00:00', 'ABANDONED');
INSERT INTO reservations (reservation_id, customer, recovery_date, reservation_date, state)
VALUES (5, 4, '2025-02-28', '2024-04-20 13:00:00', 'CANCELED');


INSERT INTO reservations (reservation_id, customer, recovery_date, reservation_date, state)
VALUES
    (6, 4, '2024-04-02', '2024-04-01 10:00:00', 'RETRIEVED'),
    (7, 4, '2024-04-16', '2024-04-15 12:00:00', 'RETRIEVED'),
    (8, 4, '2024-06-25', '2024-06-20 14:00:00', 'RETRIEVED'),
    (9, 4, '2024-09-10', '2024-09-05 16:00:00', 'RETRIEVED'),
    (10, 4, '2024-12-05', '2024-12-01 18:00:00', 'RETRIEVED');

INSERT INTO reservation_products (reservation, product_lot, quantity)
VALUES
    (6, 8, 10),
    (7, 8, 15),
    (8, 8, 20),
    (9, 8, 12),
    (10, 8, 3);


INSERT INTO reservations (reservation_id, customer, recovery_date, reservation_date, state)
VALUES
    (11, 4, '2025-03-01', '2025-03-29 10:00:00', 'RETRIEVED'),
    (12, 4, '2025-04-01', '2025-03-30 12:00:00', 'RETRIEVED'),
    (13, 4, '2025-04-08', '2025-04-05 14:00:00', 'RETRIEVED'),
    (14, 4, '2025-04-10', '2025-04-08 16:00:00', 'RETRIEVED'),
    (15, 4, '2025-04-22', '2025-04-20 10:00:00', 'RETRIEVED'),
    (16, 4, '2025-05-06', '2025-05-03 12:00:00', 'RETRIEVED');

INSERT INTO reservation_products (reservation, product_lot, quantity)
VALUES
    (11, 9, 8),
    (12, 9, 10),
    (13, 9, 5),
    (14, 9, 6),
    (15, 9, 9),
    (16, 9, 2);



INSERT INTO reservation_products (reservation, product_lot, quantity)
VALUES (1, 1, 3);
INSERT INTO reservation_products (reservation, product_lot, quantity)
VALUES (1, 5, 2);
INSERT INTO reservation_products (reservation, product_lot, quantity)
VALUES (2, 2, 4);
INSERT INTO reservation_products (reservation, product_lot, quantity)
VALUES (3, 1, 7);
INSERT INTO reservation_products (reservation, product_lot, quantity)
VALUES (3, 4, 2);
INSERT INTO reservation_products (reservation, product_lot, quantity)
VALUES (4, 1, 2);
INSERT INTO reservation_products (reservation, product_lot, quantity)
VALUES (4, 3, 5);
INSERT INTO reservation_products (reservation, product_lot, quantity)
VALUES (5, 1, 4);
INSERT INTO reservation_products (reservation, product_lot, quantity)
VALUES (5, 2, 5);


INSERT INTO notifications (id, notified_user, notification_title, notification_date, status, message) VALUES
  (1, 3, 'Bienvenue', '2025-04-25T10:00:00', 'READ', 'Bienvenue sur notre plateforme, Roger!'),
  (2,3, 'Lot Accepté', '2025-04-25T10:01:00', 'READ', 'Votre lot de Laitue Blonde de Paris a été accepté!'),
  (3,3, 'Lot Accepté', '2025-04-25T10:02:00', 'READ', 'Votre lot de Courgette Blanche d’Egypte a été accepté!'),
  (4,3, 'Lot Accepté', '2025-04-25T10:03:00', 'READ', 'Votre lot de Haricots Mistik a été accepté!'),
  (5,3, 'Lot Accepté', '2025-04-25T10:04:00', 'READ', 'Votre lot de Carottes Cosmic Purple a été accepté!'),
  (6,3, 'Lot Accepté', '2025-04-25T10:05:00', 'READ', 'Votre lot de Miel de Pissenlit Bio 250gr a été accepté!'),
  (7,3, 'Lot Refusé', '2025-04-25T10:06:00', 'UNREAD', 'Votre lot de Cerise Napoléon a été refusé car le prix est trop élevé !'),
  (8, 4, 'Bienvenue', '2025-04-25T10:07:00', 'UNREAD', 'Bienvenue sur notre plateforme, Suzanne!'),
  (9, 5, 'Bienvenue', '2025-04-25T10:08:00', 'UNREAD', 'Bienvenue sur notre plateforme, Amandine!');


-- Reset sequences
SELECT setval('product_lots_lot_id_seq', (SELECT MAX(lot_id) FROM product_lots));
SELECT setval('products_product_id_seq', (SELECT MAX(product_id) FROM products));
SELECT setval('units_unit_id_seq', (SELECT MAX(unit_id) FROM units));
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('reservations_reservation_id_seq', (SELECT MAX(reservation_id) FROM reservations));
SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications));
SELECT setval('product_types_type_id_seq', (SELECT MAX(type_id) FROM product_types));