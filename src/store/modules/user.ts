import { defineStore } from "pinia";
import {
  type userType,
  store,
  router,
  resetRouter,
  routerArrays,
  storageLocal
} from "../utils";
import defAva from "@/assets/user.jpg";

import { type LoginResult, login, getInfo, logout } from "@/api/login";

import { useMultiTagsStoreHook } from "./multiTags";
import {
  type DataInfo,
  getToken,
  setToken,
  removeToken,
  userKey
} from "@/utils/auth";
import { isEmpty, isHttp } from "@/utils/validate";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    token: getToken(),
    id: "",
    name: "",
    // 头像
    avatar: storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "",
    // 用户名
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    // 昵称
    nickname: storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "",
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    // 按钮级别权限
    permissions:
      storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [],
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    loginDay: 7
  }),
  actions: {
    /** 存储头像 */
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储昵称 */
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储按钮级别权限 */
    SET_PERMS(permissions: Array<string>) {
      this.permissions = permissions;
    },
    /** 存储是否勾选了登录页的免登录 */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    /** 设置登录页的免登录存储几天 */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    /** 登入 */
    async loginByUsername(data: any) {
      return new Promise<LoginResult>((resolve, reject) => {
        login(data)
          .then(res => {
            setToken(res.token);
            resolve(res);
          })
          .catch(error => {
            reject(error);
          });
      });
    },

    /** 获取用户信息 */
    async getInfo() {
      return new Promise<any>((resolve, reject) => {
        getInfo()
          .then(res => {
            const user = res.user;
            let avatar = user.avatar || "";
            if (!isHttp(avatar)) {
              avatar = isEmpty(avatar)
                ? defAva
                : import.meta.env.VITE_APP_BASE_API + avatar;
            }
            if (res.roles && res.roles.length > 0) {
              // 验证返回的roles是否是一个非空数组
              this.roles = res.roles;
              this.permissions = res.permissions;
            } else {
              this.roles = ["ROLE_DEFAULT"];
            }
            this.id = user.userId;
            this.name = user.userName;
            this.avatar = avatar;
            resolve(res);
          })
          .catch(error => {
            reject(error);
          });
      });
    },

    /** 退出登录 */
    async logOut() {
      return new Promise<void>((resolve, reject) => {
        logout()
          .then(() => {
            this.token = "";
            this.roles = [];
            this.permissions = [];
            removeToken();
            useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
            resetRouter();
            router.push("/login");
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      });
    }

    /** 刷新`token` */
    // async handRefreshToken(data) {
    //   return new Promise<RefreshTokenResult>((resolve, reject) => {
    //     refreshTokenApi(data)
    //       .then(data => {
    //         if (data) {
    //           setToken(data.data);
    //           resolve(data);
    //         }
    //       })
    //       .catch(error => {
    //         reject(error);
    //       });
    //   });
    // }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
