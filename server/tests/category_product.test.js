const assert = require('assert');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');

async function runTests() {
  console.log('--- Starting Category & Product Unit Tests ---');

  // Test 1: Category Schema Validation - Valid document
  {
    const validCat = new Category({
      name: '  Electronics  ',
      description: 'Gadgets and hardware',
    });
    const err = validCat.validateSync();
    assert.strictEqual(err, undefined, 'Valid category should pass validation');
    assert.strictEqual(validCat.name, 'Electronics', 'Category name should be trimmed');
    assert.strictEqual(validCat.description, 'Gadgets and hardware');
    console.log('✔ Test 1: Category valid schema and trimming passed');
  }

  // Test 2: Category Schema Validation - Missing name
  {
    const missingNameCat = new Category({});
    const err = missingNameCat.validateSync();
    assert.ok(err, 'Category without name should fail validation');
    assert.ok(err.errors.name, 'Validation error should be on name field');
    console.log('✔ Test 2: Category missing name validation passed');
  }

  // Test 3: Category Schema Validation - Exceeding maxlength (50 chars)
  {
    const longNameCat = new Category({
      name: 'A'.repeat(51),
    });
    const err = longNameCat.validateSync();
    assert.ok(err, 'Category with >50 chars name should fail validation');
    assert.ok(err.errors.name, 'Validation error should be on name field');
    console.log('✔ Test 3: Category maxlength(50) validation passed');
  }

  // Test 4: Product Schema Validation - Valid document
  {
    const catId = new mongoose.Types.ObjectId();
    const validProd = new Product({
      name: '  Wireless Mouse  ',
      description: 'Ergonomic 2.4GHz optical wireless mouse',
      price: 29.99,
      image: 'https://example.com/mouse.jpg',
      category: catId,
      stock: 10,
    });
    const err = validProd.validateSync();
    assert.strictEqual(err, undefined, 'Valid product should pass validation');
    assert.strictEqual(validProd.name, 'Wireless Mouse', 'Product name should be trimmed');
    assert.strictEqual(validProd.stock, 10);
    assert.strictEqual(validProd.price, 29.99);
    console.log('✔ Test 4: Product valid schema and trimming passed');
  }

  // Test 5: Product Schema Validation - Required fields
  {
    const emptyProd = new Product({});
    const err = emptyProd.validateSync();
    assert.ok(err, 'Empty product should fail validation');
    assert.ok(err.errors.name, 'Should require name');
    assert.ok(err.errors.description, 'Should require description');
    assert.ok(err.errors.price, 'Should require price');
    assert.ok(err.errors.image, 'Should require image');
    assert.ok(err.errors.category, 'Should require category');
    console.log('✔ Test 5: Product required fields validation passed');
  }

  // Test 6: Product Schema Validation - Price min 0.01
  {
    const catId = new mongoose.Types.ObjectId();
    const zeroPriceProd = new Product({
      name: 'Free Item',
      description: 'Zero price item',
      price: 0,
      image: 'https://example.com/item.jpg',
      category: catId,
      stock: 5,
    });
    const err = zeroPriceProd.validateSync();
    assert.ok(err, 'Product with price 0 should fail validation');
    assert.ok(err.errors.price, 'Error should be on price field');
    console.log('✔ Test 6: Product min price (0.01) validation passed');
  }

  // Test 7: Product Schema Validation - Stock default and non-negative
  {
    const catId = new mongoose.Types.ObjectId();
    const defaultStockProd = new Product({
      name: 'Item Default Stock',
      description: 'Testing default stock',
      price: 15.00,
      image: 'https://example.com/item.jpg',
      category: catId,
    });
    assert.strictEqual(defaultStockProd.stock, 0, 'Default stock should be 0');

    const negativeStockProd = new Product({
      name: 'Item Negative Stock',
      description: 'Testing negative stock',
      price: 15.00,
      image: 'https://example.com/item.jpg',
      category: catId,
      stock: -5,
    });
    const err = negativeStockProd.validateSync();
    assert.ok(err, 'Negative stock should fail validation');
    assert.ok(err.errors.stock, 'Error should be on stock field');
    console.log('✔ Test 7: Product stock default & non-negative validation passed');
  }

  // Test 8: Product Indexes Verification
  {
    const indexes = Product.schema.indexes();
    const hasTextIndex = indexes.some(([fields]) => fields.name === 'text' && fields.description === 'text');
    const hasCategoryIndex = indexes.some(([fields]) => fields.category === 1);
    assert.ok(hasTextIndex, 'Product schema must have text index on name and description');
    assert.ok(hasCategoryIndex, 'Product schema must have index on category');
    console.log('✔ Test 8: Product text and category indexes verified');
  }

  // Test 9: Category Controller createCategory validation
  {
    const req = { body: { name: '   ' } };
    let resStatus = 0;
    let resJson = null;
    const res = {
      status(code) {
        resStatus = code;
        return this;
      },
      json(data) {
        resJson = data;
      },
    };

    await categoryController.createCategory(req, res, () => {});
    assert.strictEqual(resStatus, 400, 'Empty category name should return status 400');
    assert.strictEqual(resJson.success, false);
    console.log('✔ Test 9: Category controller rejects empty name');
  }

  // Test 10: Product Controller createProduct validation
  {
    const req = {
      body: {
        name: 'Item',
        description: 'Desc',
        price: -10, // Invalid price
        image: 'img.png',
        category: new mongoose.Types.ObjectId().toString(),
      },
    };
    let resStatus = 0;
    let resJson = null;
    const res = {
      status(code) {
        resStatus = code;
        return this;
      },
      json(data) {
        resJson = data;
      },
    };

    await productController.createProduct(req, res, () => {});
    assert.strictEqual(resStatus, 400, 'Negative price in product creation should return 400');
    assert.strictEqual(resJson.success, false);
    console.log('✔ Test 10: Product controller rejects invalid price');
  }

  // Test 11: Route definitions check
  {
    const categoryRoutes = require('../routes/categoryRoutes');
    const productRoutes = require('../routes/productRoutes');
    assert.ok(categoryRoutes.stack.length > 0, 'Category router has routes configured');
    assert.ok(productRoutes.stack.length > 0, 'Product router has routes configured');
    console.log('✔ Test 11: Routers loaded and configured with endpoints');
  }

  // Test 12: Seeder Data check
  {
    const seedDataContent = require('fs').readFileSync(
      require('path').join(__dirname, '../seeder/seedData.js'),
      'utf8'
    );
    assert.ok(seedDataContent.includes('Electronics'), 'Seeder contains Electronics');
    assert.ok(seedDataContent.includes('Fashion'), 'Seeder contains Fashion');
    assert.ok(seedDataContent.includes('Shoes'), 'Seeder contains Shoes');
    assert.ok(seedDataContent.includes('Home & Living'), 'Seeder contains Home & Living');
    assert.ok(seedDataContent.includes('sampleProducts'), 'Seeder contains sample products');
    assert.ok(seedDataContent.includes('stock:'), 'Seeder contains product stock');
    console.log('✔ Test 12: Seeder script integrity verified');
  }

  console.log('\n--- ALL UNIT TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
