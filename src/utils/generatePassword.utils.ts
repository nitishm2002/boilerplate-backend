function generateRandomPassword(length: number) {
  const lowercaseCharset = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digitCharset = '0123456789';
  const specialCharset = '!@#$%^&*()-_=+';
  const combinedCharset = lowercaseCharset + uppercaseCharset + digitCharset + specialCharset;

  let password = '';

  // Ensure at least one character from each charset
  password += lowercaseCharset[Math.floor(Math.random() * lowercaseCharset.length)];
  password += uppercaseCharset[Math.floor(Math.random() * uppercaseCharset.length)];
  password += digitCharset[Math.floor(Math.random() * digitCharset.length)];
  password += specialCharset[Math.floor(Math.random() * specialCharset.length)];

  const remainingLength = length - 4; // Subtracting 4 because we've already added one from each charset

  // Fill the remaining length with random characters from combined charset
  for (let i = 0; i < remainingLength; i++) {
    password += combinedCharset[Math.floor(Math.random() * combinedCharset.length)];
  }

  // Shuffle the characters in the password
  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  return password;
}

export default generateRandomPassword;
