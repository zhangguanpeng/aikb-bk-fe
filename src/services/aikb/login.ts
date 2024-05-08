// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 发送验证码 POST /api/login/captcha */
export async function getFakeCaptcha(
  params: {
    // query
    /** 手机号 */
    phone?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.FakeCaptcha>('/api/login/captcha', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 用户登录 POST /aikb/v1/login */
export async function login(params: any) {
  let formData = new FormData();
  formData.append('username', params.username);
  formData.append('password', params.password);
  
  return request('/aikb/v1/login', {
    method: 'POST',
    headers: {
      // 'Content-Type': 'form-data',
    },
    transformRequest: [
      function (data, headers: any) {
        // 去除post请求默认的Content-Type
        delete headers.post['Content-Type'];
        return data;
      },
    ],
    data: params,
    // formData,
  });
}
