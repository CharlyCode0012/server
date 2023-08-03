INSERT INTO orders (folio, date_order, total, amount, state, id_client, id_place, id_payment_method, createdAt, updatedAt)
VALUES
('1238423A91', CURRENT_DATE(), 225.70, 0, 'NA', '3325248063', '1', '1', NOW(), NOW()),
('0038523E70', CURRENT_DATE(),189.00, 0, 'NA', '3325248063', '1', '2', NOW(), NOW()),
('092742FC58', CURRENT_DATE(),179.00, 0, 'NA', '3325248063', '2', '2', NOW(), NOW()),
('5137423FG0', CURRENT_DATE(), 340.70, 0, 'NA', '3325248063', '3', '1', NOW(), NOW()),
('8018523EFA', CURRENT_DATE(),500.00, 0, 'NA', '3325248063', '1', '1', NOW(), NOW()),
('7318523EFF', CURRENT_DATE(),500.00, 0, 'NA', '3338094097', '1', '2', NOW(), NOW()),
('5218523AFB', CURRENT_DATE(),500.00, 0, 'NA', '3338094097', '1', '2', NOW(), NOW()),
('6018523A00', CURRENT_DATE(),500.00, 0, 'NA', '3338094097', '1', '2', NOW(), NOW()),
('912742FC12', CURRENT_DATE(),1200.00, 0, 'NA', '3325248063', '1', '1', NOW(), NOW());

INSERT INTO orders (folio, date_order, total, amount, state, id_client, id_place, id_payment_method, createdAt, updatedAt)
VALUES
('1238423A91', CONVERT_TZ(CONCAT(CURRENT_DATE(), ' 09:45:00'), 'America/Mexico_City', 'UTC') + INTERVAL 6 HOUR, 225.70, 0, 'NA', '3325248063', '1', '1', NOW(), NOW()),

('0F38423AC1', CONVERT_TZ(CONCAT(CURRENT_DATE(), ' 10:00:00'), 'America/Mexico_City', 'UTC') + INTERVAL 6 HOUR, 225.70, 0, 'NA', '3338094097', '1', '1', NOW(), NOW()),

('00B84230FA',CONVERT_TZ(CONCAT(CURRENT_DATE(), ' 10:30:00'), 'America/Mexico_City', 'UTC') + INTERVAL 6 HOUR, 225.70, 0, 'NA', '3338094097', '1', '1',  NOW(), NOW());
