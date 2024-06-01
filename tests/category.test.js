const chai = require('chai');
const expect = chai.expect;
const Category = require('../models/category');

describe('Category Model', () => {
  it('should create a new category', () => {
    const categoryData = {
      title: 'Electronics',
      description: 'Electronic products category'
    };
    const category = new Category(categoryData);
    expect(category.title).to.equal(categoryData.title);
    expect(category.description).to.equal(categoryData.description);
  });

  it('should not allow empty title', () => {
    const categoryData = {
      description: 'Electronic products category'
    };
    const category = new Category(categoryData);
    category.validate(err => {
      expect(err.errors.title).to.exist;
    });
  });
});
