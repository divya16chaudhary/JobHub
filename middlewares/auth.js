import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  var { token } = req.cookies;
  //console.log(token);
  if (!token) {
    return next(new ErrorHandler("User Not Authorized", 400));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
 // console.log(decoded.id);
  req.user = await User.findById(decoded.id);
  const userrr=await User.findById(decoded.id);
  next();
});
// import { User } from "../models/userSchema.js";
// import { catchAsyncErrors } from "./catchAsyncError.js";
// import ErrorHandler from "./error.js";
// import jwt from "jsonwebtoken";

// export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
//   // Log the incoming cookies to see if the token is present
//   console.log("Cookies:", req.cookies);

//   const { token } = req.cookies;
  
//   if (!token) {
//     console.log("No token found, user not authorized.");
//     return next(new ErrorHandler("User Not Authorized", 400));
//   }

//   try {
//     // Verify the token and log the decoded data
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//     console.log("Decoded Token:", decoded);

//     // Find the user by the decoded ID and log the user details
//     req.user = await User.findById(decoded.id);
//     console.log("Authenticated User:", req.user);

//     next();
//   } catch (err) {
//     console.log("Error during token verification:", err.message);
//     return next(new ErrorHandler("User Not Authorized", 400));
//   }
// });
