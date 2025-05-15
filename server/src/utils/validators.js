/**
 * Validates if an email is a Gmail address
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid Gmail, false otherwise
 */
export const isValidGmail = (email) => {
  if (!email) return false;
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Check if it's a Gmail address
  const domain = email.split('@')[1].toLowerCase();
  return domain === 'gmail.com';
};

/**
 * Validates if a string is a valid password
 * @param {string} password - The password to validate
 * @returns {boolean} - True if valid password, false otherwise
 */
export const isValidPassword = (password) => {
  if (!password) return false;
  
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};