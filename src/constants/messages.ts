export const USER_MESSAGE = {
  VALIDATION_ERROR : 'validation_error',
  USER_NOT_FOUND: "User not found",
  NAME: {
    REQUIRED: 'Tên không được để trống',
    INVALID: 'Tên phải là chuỗi từ 1 đến 100 ký tự'
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
  LOGIN_SUCCESS: "Login success",
  REGISTER_SUCCESS : "Register success"
} as const