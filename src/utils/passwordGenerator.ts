const CHARS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

export function generatePassword(length = 12): string {
  const allChars = Object.values(CHARS).join('');
  let password = '';

  // Ensure at least one character from each category
  password += CHARS.uppercase[Math.floor(Math.random() * CHARS.uppercase.length)];
  password += CHARS.lowercase[Math.floor(Math.random() * CHARS.lowercase.length)];
  password += CHARS.numbers[Math.floor(Math.random() * CHARS.numbers.length)];
  password += CHARS.symbols[Math.floor(Math.random() * CHARS.symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}