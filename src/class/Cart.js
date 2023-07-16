class Cart {
    products = [new ProductCart()];
    totalPrice = 0.0;
  
    constructor(cartData = {}) {
      this.products = Array.isArray(cartData.products) ? cartData.products : [];
      this.totalPrice = cartData?.totalPrice ?? 0.0;
    }
  
    set setProducts(products = [new ProductCart()]) {
      this.products = products;
    }
  
    set setProduct(product = new ProductCart()) {
      this.products.push(product);
    }
  
    set sumTotalPrice(sum = 0.0) {
      this.totalPrice += sum;
    }
  
    set setTotalPrice(totalPrice = 0.0) {
      this.totalPrice = totalPrice;
    }
  
    removeProduct(index, cantidadQuitar = 1) {
      if (index >= 0 && index < this.products.length) {
        const product = this.products[index];
  
        if (product.quantity > cantidadQuitar) {
          // Actualizar la cantidad y el precio total del producto
          product.setQuantity(product.quantity - cantidadQuitar);
          product.totalPrice = product.price * product.quantity;
  
          // Actualizar el precio total del carrito
          this.totalPrice -= product.price * cantidadQuitar;
  
          console.log(`Se han quitado ${cantidadQuitar} unidades del producto "${product.product_name}".`);
        } else {
          // Eliminar el producto del carrito
          const removedProduct = this.products.splice(index, 1)[0];
          this.totalPrice -= removedProduct.totalPrice;
  
          console.log(`Se ha quitado el producto "${removedProduct.product_name}" del carrito.`);
        }
      } else {
        console.log(`Índice inválido. No se ha quitado ningún producto del carrito.`);
      }
    }
  }
  
  class ProductCart {
    id = "";
    product_name = "";
    quantity = 0;
    price = 0.0;
    totalPrice = 0.0;
  
    constructor(productCartData = {}) {
      this.id = productCartData?.id ?? "";
      this.product_name = productCartData?.product_name ?? "";
      this.quantity = productCartData?.quantity ?? 1;
      this.price = productCartData?.price ?? 0.0;
      this.totalPrice = this.price * this.quantity;
    }
  
    set setId(id = "") {
      this.id = id;
    }
  
    set setProductName(product_name = "") {
      this.product_name = product_name;
    }
  
    set setQuantity(quantity = 0) {
      this.quantity = quantity;
    }
  
    set setPrice(price = 0.0) {
      this.price = price;
    }
  
    set setTotalPrice(price) {
      this.totalPrice = price;
    }
  }
  
  module.exports = { Cart, ProductCart };
  