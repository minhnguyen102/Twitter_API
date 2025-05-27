export const USER_MESSAGE = {
  VALIDATION_ERROR : 'validation_error',
  USER_NOT_FOUND: "User not found",
  LOGIN_SUCCESS: "Login success",
  REGISTER_SUCCESS : "Register success",
  ACCESS_TOKEN_IS_REQUIRED: "Access token is required",
  REFRESH_TOKEN_IS_REQUIRED: "Refresh token is required",
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: "Email verify token is required",
  REFRESH_TOKEN_IS_INVALID: "Refresh token is invalid",
  USED_REFRESH_TOKEN_OR_NOT_EXIT: "Used refresh token or not exit",
  EMAIL_ALREADY_VERIFIED_BEFORE: "Email already verify before",
  LOGOUT_SUCCESS: "Logout Successfully",
  VERIFY_EMAIL_SUCCESS: "Verify email success",
  USER_ALREADY_VERIFIED: "User is already verified.",
  RESEND_VERIFY_EMAIL_SUCCESS: "Resend verify email success",
  CHECK_EMAIL_TO_RESET_PASSWORD: "Check email to reset password",
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: "Forgot password token is reuquired",
  FORGOT_PASSWORD_TOKEN_IS_INVALID: "Forgot password token is invalid",
  VERIFY_FORGOT_PASSWORD_SUCCESS: "Verify forgot password success",
  RESET_PASSWORD_SUCCESS: "Reset password success",
  USER_NOT_VERIFIED: "User not verified",
  BIO_MUST_BE_STRING: "Bio must be string",
  LOCATION_MUST_BE_STRING : "Location must be string",
  UPDATE_ME_SUCCESS: "Update profile success",
  FOLLOW_SUCCESS: "Follow user success",
  INVALID_FOLLOWED_USER_ID: "Invalid followed user id",
  FOLLOWED_USER: "Followed user",
  UNFOLLOW_SUCCESS: "Unfollow success",
  OLD_PASSWORD_NOT_MATCH: "Old password not match",
  CHANGE_PASSWORD_SUCCESS: "Change password success",
  USERNAME_EXISTED: "Username existed",
  NAME: {
    REQUIRED: 'Tên không được để trống',
    INVALID: 'Tên phải là chuỗi từ 1 đến 100 ký tự',
    STRING: 'Name must be string'
  },
  EMAIL: {
    REQUIRED: 'Email không được để trống',
    INVALID: 'Email không hợp lệ',
    EXISTS: 'Email đã tồn tại'
  },
  PASSWORD: {
    REQUIRED: 'Mật khẩu không được để trống',
    LENGTH: 'Mật khẩu phải từ 8 đến 50 ký tự',
    WEAK: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'
  },
  CONFIRM_PASSWORD: {
    REQUIRED: 'Xác nhận mật khẩu không được để trống',
    LENGTH: 'Mật khẩu phải từ 8 đến 50 ký tự',
    WEAK: 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt',
    NOT_MATCH: 'Xác nhận mật khẩu không khớp'
  },
  DATE_OF_BIRTH: {
    INVALID: 'Ngày sinh không đúng định dạng IOS8601'
  },
  BIO: {
    STRING: "Bio must be string",
    LENGTH: "Bio length must be from 1 to 100"
  },
  LOCATION: {
    STRING: "Location must be string",
    LENGTH: "Location length must be from 1 to 100"
  },
  WEBSITE: {
    STRING: "Website must be string",
    LENGTH: "Website length must be from 1 to 300"
  },
  USERNAME: {
    STRING: "Website must be string",
    LENGTH: "Website length must be from 1 to 100",
    INVALID: "Username must be 4-15 characters long and contain only letter, numbers, underscore not only number"
  },
  IMAGE: {
    STRING: "Image must be string",
    LENGTH: "Image length must be from 1 to 400"
  },
} as const