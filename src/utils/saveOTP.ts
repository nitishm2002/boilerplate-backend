// // import { IToken, Token } from '../models/token.model';

// export async function handleOTP(
//   user_id: number,
//   otp_type: string,
//   OTP: string,
//   user_type: string,
//   mobile_number: string,
// ): Promise<void> {
//   const existingToken: IToken = await Token.findOne({
//     where: {
//       user_id: user_id,
//       mobile_number: mobile_number,
//       otp_type: otp_type,
//       user_type: user_type,
//     },
//   });

//   if (existingToken) {
//     await existingToken.update({ otp: OTP });
//   } else {
//     await Token.create({
//       user_id: user_id,
//       mobile_number: mobile_number,
//       otp_type: otp_type,
//       user_type: user_type,
//       otp: OTP,
//     });
//   }
// }
