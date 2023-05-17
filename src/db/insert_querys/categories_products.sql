INSERT INTO categories_products (id_product, id_category, createdAt, updatedAt)
VALUES 
('206', '5', NOW(), NOW()),
('101', '7', NOW(), NOW()),
('102', '7', NOW(), NOW()),
('103', '7', NOW(), NOW()),
('104', '7', NOW(), NOW()),
('105', '7', NOW(), NOW()),
('106', '7', NOW(), NOW()),
('107', '7', NOW(), NOW()),
('108', '7', NOW(), NOW()),
('109', '7', NOW(), NOW()),
('110', '7', NOW(), NOW()),
('111', '7', NOW(), NOW()),
('112', '7', NOW(), NOW());

/*
 SELECT p.*, cat.category_name AS category_name
    FROM products p
    INNER JOIN catalog_products cp ON cp.id_product = p.id
    INNER JOIN catalogs c ON c.id = cp.id_catalog
    INNER JOIN categories_products catp ON catp.id_product = p.id
    INNER JOIN categories cat ON cat.id = catp.id_category
    WHERE c.id = '11'
    ORDER BY p.product_name ASC
*/