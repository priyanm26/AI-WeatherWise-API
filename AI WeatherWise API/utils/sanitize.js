/**
  * Recursively sanitizes objects to strip potential NoSQL injection operators (e.g., $gt, $ne, $where)
  */
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim();
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (input !== null && typeof input === 'object') {
    const cleanObj = {};
    for (const key of Object.keys(input)) {
      if (!key.startsWith('$')) {
        cleanObj[key] = sanitizeInput(input[key]);
      }
    }
    return cleanObj;
  }
  return input;
};

module.exports = { sanitizeInput };
