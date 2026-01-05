// Generate a 4-digit OTP
function generateOTP() {
  // let otp = '';
  let otp = '';
  do {
    otp = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
  } while (otp.length !== 4);

  return otp;
}

export default generateOTP;
