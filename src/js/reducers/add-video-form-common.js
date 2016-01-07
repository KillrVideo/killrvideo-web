/**
 * Common form fields
 */
export const commonFields = [ 'name', 'description', 'tags' ];

/**
 * Common form field initial values
 */
export const commonInitialValues = {
  name: '',
  description: '',
  tags: []
};

/**
 * Common form field validation constraints
 */
export const commonConstraints = {
  name: { presence: true },
  tags: {
    length: { maximum: 10, message: '^No more than 10 tags are allowed' },
    preventDuplicates: true
  }
};