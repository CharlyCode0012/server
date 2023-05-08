/* -- catálogo ropa
INSERT INTO products (id, name, key_word, price, stock, img, catalog_id, createdAt, updatedAt)
SELECT CONCAT('prod', LPAD(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), 3, '0')), 
       CONCAT('Ropa ', LPAD(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), 3, '0')), 
       CONCAT('ropa, producto, ', LPAD(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), 3, '0')), 
       ROUND(RAND() * 1000, 2), 
       ROUND(RAND() * 50), 
       CONCAT('src/img/ropa/', LPAD(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), 3, '0'), '.jpg'), 
       'R', NOW(), NOW()
FROM catalogs 
WHERE name = 'ropa'
LIMIT 10;

-- catálogo calzado
INSERT INTO products (id, name, key_word, price, stock, img, catalog_id, createdAt, updatedAt)
SELECT CONCAT('prod', LPAD(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), 3, '0')), 
       CONCAT('Calzado ', LPAD(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), 3, '0')), 
       CONCAT('calzado, zapato, ', LPAD(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), 3, '0')), 
       ROUND(RAND() * 2000, 2), 
       ROUND(RAND() * 30), 
       CONCAT('src/img/calzado/', LPAD(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), 3, '0'), '.jpg'), 
       'C', NOW(), NOW()
FROM catalogs 
WHERE name = 'calzado'
LIMIT 10;

-- catálogo articulos de papeleria
INSERT INTO products (id, name, key_word, price, stock, img, catalog_id, createdAt, updatedAt)
SELECT CONCAT('prod', LPAD(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), 3, '0')), 
       CONCAT('Articulo de Papeleria ', LPAD(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), 3, '0')), 
       CONCAT('papeleria, articulo, ', LPAD(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), 3, '0')), 
       ROUND(RAND() * 500, 2), 
       ROUND(RAND() * 100), 
       CONCAT('src/img/papeleria/', LPAD(ROW_NUMBER() OVER (ORDER BY (SELECT NULL)), 3, '0'), '.jpg'), 
       'P', NOW(), NOW()
FROM catalogs 
WHERE name = 'articulos de papeleria'
LIMIT 10; */
INSERT INTO products (id, name, key_word, price, stock, img, createdAt, updatedAt)
VALUES
('301', 'Laptop Dell Inspiron 15', 'laptop, dell, inspiron, computadora', 1000.00, 50, 'src/img/Electrónicos/dell_inspiron_15.jpg',  NOW(), NOW()),
('302', 'Smartphone Samsung Galaxy S21', 'smartphone, samsung, galaxy, s21', 1200.00, 30, 'src/img/Electrónicos/samsung_galaxy_s21.jpg',  NOW(), NOW()),
('303', 'Tablet Apple iPad Pro', 'tablet, apple, ipad, pro', 899.00, 20, 'src/img/Electrónicos/apple_ipad_pro.jpg', NOW(), NOW()),
('304', 'Smartwatch Apple Watch Series 7', 'smartwatch, apple, watch, series 7', 399.00, 10, 'src/img/Electrónicos/apple_watch_series_7.jpg', NOW(), NOW()),
('305', 'Cámara Canon EOS R6', 'cámara, canon, eos, r6', 2500.00, 5, 'src/img/Electrónicos/canon_eos_r6.jpg', NOW(), NOW()),
('306', 'Auriculares Sony WH-1000XM4', 'auriculares, sony, wh-1000xm4', 349.99, 15, 'src/img/Electrónicos/sony_wh-1000xm4.jpg', NOW(), NOW()),
('307', 'Televisor LG OLED C1', 'televisor, lg, oled, c1', 1899.99, 8, 'src/img/Electrónicos/lg_oled_c1.jpg', NOW(), NOW()),
('308', 'Consola de videojuegos Sony PlayStation 5', 'consola, videojuegos, sony, playstation 5', 499.99, 12, 'src/img/Electrónicos/sony_playstation_5.jpg', NOW(), NOW()),
('101', 'Cuaderno Rayado', 'cuaderno, rayado, escolar', 4.99, 100, 'src/img/Artículos de Papelería/cuaderno-rayado.jpg', NOW(), NOW()),
('102', 'Cuaderno Cuadriculado', 'cuaderno, cuadriculado, escolar', 5.99, 75, 'src/img/Artículos de Papelería/cuaderno-cuadriculado.jpg', NOW(), NOW()),
('103', 'Bolígrafo Azul', 'boligrafo, azul, tinta', 1.49, 200, 'src/img/Artículos de Papelería/boligrafo-azul.jpg',  NOW(), NOW()),
('104', 'Bolígrafo Negro', 'boligrafo, negro, tinta', 1.49, 200, 'src/img/Artículos de Papelería/boligrafo-negro.jpg',  NOW(), NOW()),
('105', 'Lápiz Mecánico', 'lápiz, mecánico, grafito', 2.99, 50, 'src/img/Artículos de Papelería/lapiz-mecanico.jpg', NOW(), NOW()),
('106', 'Lápices de Colores', 'lápices, colores, arte', 8.99, 25, 'src/img/Artículos de Papelería/lapices-colores.jpg', NOW(), NOW()),
('107', 'Resaltador Amarillo', 'resaltador, amarillo, texto', 1.99, 100, 'src/img/Artículos de Papelería/resaltador-amarillo.jpg', NOW(), NOW()),
('108', 'Resaltador Verde', 'resaltador, verde, texto', 1.99, 100, 'src/img/Artículos de Papelería/resaltador-verde.jpg', NOW(), NOW()),
('109', 'Cinta Adhesiva', 'cinta, adhesiva, oficina', 3.49, 50, 'src/img/Artículos de Papelería/cinta-adhesiva.jpg', NOW(), NOW()),
('110', 'Tijeras', 'tijeras, oficina, cortar', 4.99, 40, 'src/img/Artículos de Papelería/tijeras.jpg', NOW(), NOW()),
('111', 'Goma de Borrar', 'goma, borrar, escolar', 0.99, 150, 'src/img/Artículos de Papelería/goma-borrar.jpg', NOW(), NOW()),
('112', 'Regla de Plástico', 'regla, plástico, medida', 1.99, 100, 'src/img/Artículos de Papelería/regla-plastico.jpg', NOW(), NOW()),
('201', 'Camiseta blanca', 'camiseta, ropa, blanca', 15.99, 50, 'src/img/ropa/camiseta_blanca.jpg',  NOW(), NOW()),
('202', 'Pantalón de mezclilla', 'pantalon, mezclilla, jeans', 29.99, 20, 'src/img/ropa/pantalon_mezclilla.jpg', NOW(), NOW()),
('203', 'Suéter negro', 'sueter, ropa, negro', 39.99, 30, 'src/img/ropa/sueter_negro.jpg', NOW(), NOW()),
('204', 'Chamarra de piel', 'chamarra, piel, ropa', 89.99, 10, 'src/img/ropa/chamarra_piel.jpg',  NOW(), NOW()),
('205', 'Vestido rojo', 'vestido, ropa, rojo', 49.99, 15, 'src/img/ropa/vestido_rojo.jpg', NOW(), NOW()),
('206', 'Zapatos de vestir negros', 'zapatos, vestir, negros, ropa', 69.99, 10, 'src/img/ropa/zapatos_vestir_negros.jpg', NOW(), NOW()),
('207', 'Gorra blanca', 'gorra, blanca, ropa', 9.99, 25, 'src/img/ropa/gorra_blanca.jpg', NOW(), NOW()),
('208', 'Calcetines negros', 'calcetines, negros, ropa', 4.99, 50, 'src/img/ropa/calcetines_negros.jpg', NOW(), NOW()),
('209', 'Traje de baño femenino', 'traje baño, femenino, ropa', 24.99, 20, 'src/img/ropa/traje_bano_femenino.jpg',  NOW(), NOW()),
('210', 'Traje de baño masculino', 'traje baño, masculino, ropa', 29.99, 15, 'src/img/ropa/traje_bano_masculino.jpg',  NOW(), NOW()),
('211', 'Muñeco de acción', 'muñeco, acción, juguete', 29.99, 50, 'src/img/Juguetes/muneco_accion.jpg', NOW(), NOW()),
('212', 'Carro de control remoto', 'carro, control, remoto, juguete', 59.99, 30, 'src/img/Juguetes/carro_control_remoto.jpg', NOW(), NOW()),
('213', 'Set de bloques de construcción', 'bloques, construcción, juguete', 19.99, 100, 'src/img/Juguetes/set_bloques_construccion.jpg' , NOW(), NOW()),
('214', 'Juego de mesa Monopoly', 'monopoly, juego, mesa, juguete', 39.99, 20, 'src/img/Juguetes/monopoly.jpg',  NOW(), NOW()),
('215', 'Peluche de osito', 'peluche, osito, juguete', 9.99, 200, 'src/img/Juguetes/peluche_osito.jpg',NOW(), NOW()),
('216', 'Rompecabezas de 500 piezas', 'rompecabezas, piezas, juguete', 14.99, 50, 'src/img/Juguetes/rompecabezas_500_piezas.jpg',  NOW(), NOW()),
('217', 'Juguete de construcción de carreteras', 'juguete, construcción, carreteras', 24.99, 40, 'src/img/Juguetes/juguete_construccion_carreteras.jpg', NOW(), NOW()),
('218', 'Pistola de juguete con dardos', 'pistola, juguete, dardos', 12.99, 60, 'src/img/Juguetes/pistola_juguete_dardos.jpg',  NOW(), NOW()),
('219', 'Juguete de pelota de playa', 'juguete, pelota, playa', 7.99, 100, 'src/img/Juguetes/juguete_pelota_playa.jpg', NOW(), NOW()),
('220', 'Cocinita de juguete', 'cocinita, juguete', 49.99, 10, 'src/img/Juguetes/cocinita_juguete.jpg', NOW(), NOW()),
('231', 'Detergente líquido 1L', 'detergente, limpieza, lavandería', 25.99, 50, 'src/img/limpieza/detergente_1L.jpg', NOW(), NOW()),
('232', 'Lavandina 1L', 'lavandina, limpieza, desinfectante', 12.99, 100, 'src/img/limpieza/lavandina_1L.jpg', NOW(), NOW()),
('233', 'Jabón en polvo 1Kg', 'jabón, polvo, limpieza, lavandería', 29.99, 40, 'src/img/limpieza/jabon_en_polvo_1kg.jpg', NOW(), NOW()),
('234', 'Limpiador de piso 500ml', 'limpiador, piso, limpieza', 10.99, 75, 'src/img/limpieza/limpiador_piso_500ml.jpg', NOW(), NOW()),
('235', 'Desengrasante 1L', 'desengrasante, limpieza, cocina', 35.99, 30, 'src/img/limpieza/desengrasante_1L.jpg', NOW(), NOW()),
('236', 'Limpiavidrios 500ml', 'limpiavidrios, limpieza, ventanas', 15.99, 50, 'src/img/limpieza/limpiavidrios_500ml.jpg', NOW(), NOW()),
('237', 'Desinfectante en aerosol 300ml', 'desinfectante, aerosol, limpieza', 18.99, 80, 'src/img/limpieza/desinfectante_aerosol_300ml.jpg', NOW(), NOW()),
('238', 'Esponjas pack x3', 'esponjas, limpieza, vajilla', 8.99, 150, 'src/img/limpieza/esponjas_pack_x3.jpg', NOW(), NOW()),
('239', 'Fibras pack x2', 'fibras, limpieza, vajilla', 6.99, 100, 'src/img/limpieza/fibras_pack_x2.jpg', NOW(), NOW()),
('240', 'Guantes de látex', 'guantes, látex, limpieza', 5.99, 200, 'src/img/limpieza/guantes_de_latex.jpg', NOW(), NOW()),
('241', 'Recogedor y escoba', 'recogedor, escoba, limpieza', 22.99, 50, 'src/img/limpieza/recogedor_escoba.jpg', NOW(), NOW()),
('242', 'Palo de madera', 'palo, madera, limpieza', 9.99, 100, 'src/img/limpieza/palo_madera.jpg', NOW(), NOW());