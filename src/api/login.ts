import { http } from "@/utils/http";

export type LoginResult = {
  msg: string;
  code: number;
  token: string;
};

/** 登录 */
export const login = (data?: object) => {
  return http.request<LoginResult>("post", "/login", { data });
};

/** 获取用户详细信息 */
export const getInfo = () => {
  return http.request<any>("get", "/getInfo");
};

/** 退出登录 */
export const logout = () => {
  return http.request<any>("post", "/logout");
};

/** 获取验证码 */
export const getCodeImg = () => {
  return http.request<any>("get", "/captchaImage");
};
