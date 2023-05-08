//se crea el cliente cuando hace 1 compra exitosa (se entrega).
INSERT INTO clients (Id, number, purcharses, createdAt, updatedAt)
VALUES 
    ('1', CONCAT('33', LPAD(FLOOR(RAND() * 10000000), 7, '0'), LPAD(FLOOR(RAND() * 1000), 3, '0')), 0, NOW(), NOW()),
    ('2', CONCAT('33', LPAD(FLOOR(RAND() * 10000000), 7, '0'), LPAD(FLOOR(RAND() * 1000), 3, '0')), 0, NOW(), NOW()),
    ('3', CONCAT('33', LPAD(FLOOR(RAND() * 10000000), 7, '0'), LPAD(FLOOR(RAND() * 1000), 3, '0')), 0, NOW(), NOW()),
    ('4', CONCAT('33', LPAD(FLOOR(RAND() * 10000000), 7, '0'), LPAD(FLOOR(RAND() * 1000), 3, '0')), 0, NOW(), NOW()),
    ('5', CONCAT('33', LPAD(FLOOR(RAND() * 10000000), 7, '0'), LPAD(FLOOR(RAND() * 1000), 3, '0')), 0, NOW(), NOW()),
    ('6', CONCAT('33', LPAD(FLOOR(RAND() * 10000000), 7, '0'), LPAD(FLOOR(RAND() * 1000), 3, '0')), 0, NOW(), NOW()),
    ('7', CONCAT('33', LPAD(FLOOR(RAND() * 10000000), 7, '0'), LPAD(FLOOR(RAND() * 1000), 3, '0')), 0, NOW(), NOW()),
    ('8', CONCAT('33', LPAD(FLOOR(RAND() * 10000000), 7, '0'), LPAD(FLOOR(RAND() * 1000), 3, '0')), 0, NOW(), NOW()));