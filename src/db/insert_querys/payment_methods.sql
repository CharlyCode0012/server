INSERT INTO payment_methods (id, name, CLABE, no_card, bank, subsidary, createdAt, updatedAt)
VALUES 
    ('1', 'Juan Perez', '123456789012345678', '1234 5678 9012 3456', 'Santander', 'Sucursal 1', NOW(), NOW()),
    ('2', 'Maria Gonzalez', '098765432109876543', '9876 5432 1098 7654', 'BBVA Bancomer', 'Sucursal 2', NOW(), NOW()),
    ('3', 'Carlos Hernandez', '246813579024681357', '2468 1357 9024 6813', 'Citibanamex', 'Sucursal 3', NOW(), NOW()),
    ('4', 'Sofia Rodriguez', '135792468013579246', '1357 9246 8013 5792', 'Banorte', 'Sucursal 4', NOW(), NOW()),
    ('5', 'Jose Martinez', '802468135980246813', '8024 6813 5980 2468', 'Scotiabank', 'Sucursal 5', NOW(), NOW());