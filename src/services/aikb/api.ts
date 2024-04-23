// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取用户有权限的类目列表 GET /aikb/v1/category */
export async function getCategoryData(options?: { [key: string]: any }) {
  return request('/aikb/v1/category', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 新增类目 POST /aikb/v1/category */
export async function addCategory(params: any) {
  return request('/aikb/v1/category', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

/** 修改类目 PUT /aikb/v1/category/{categoryId} */
export async function updateCategory(parentId: string, params: any) {
  // @ts-ignore
  return request(`/aikb/v1/category/${parentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

/** 删除类目 DELETE /aikb/v1/category/{categoryId} */
export async function deleteCategory(selectedKey: string) {
  // @ts-ignore
  return request(`/aikb/v1/category/${selectedKey}`, {
    method: 'DELETE',
  });
}

/** 获取文档列表 GET /aikb/v1/doc */
export async function getDocumentData(params: any) {
  return request('/aikb/v1/doc', {
    method: 'GET',
    params: params,
  });
}

/** 删除文档 DELETE */
export async function deleteDocument(id: string) {
  // @ts-ignore
  return request(`/aikb/v1/doc?id=${id}`, {
    method: 'DELETE',
  });
}

/** 文档上传 POST */
export async function uploadDocument(params: any) {
  return request('/aikb/v1/doc/upload', {
    method: 'POST',
    headers: {
      // 'Content-Type': 'multipart/form-data',
    },
    transformRequest: [
      function (data, headers: any) {
        // 去除post请求默认的Content-Type
        delete headers.post['Content-Type'];
        return data;
      },
    ],
    data: params,
  });
}

/** 文档下载 POST */
export async function downloadDocument(id: string) {
  return request(`/aikb/v1/doc/download?id=${id}`, {
    method: 'GET',
    // headers: {
    // 	'Content-Type': 'application/json',
    // },
  });
}

/** 文本搜索 GET /aikb/v1/search */
export async function getTextData(params: any) {
  return request('/aikb/v1/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

/** 创建会话 POST /aikb/v1/chat */
export async function createChat(options?: { [key: string]: any }) {
  return request('/aikb/v1/chat', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除会话 DELETE /aikb/v1/chat/{chatId} */
export async function deleteChat(body: any, options?: { [key: string]: any }) {
  // @ts-ignore
  const { chatId = '' } = body;
  return request(`/aikb/v1/chat/{chatId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 对话搜索 PUT /aikb/v1/chat/{chatId} */
export async function queryChat(body: API.LoginParams, options?: { [key: string]: any }) {
  // @ts-ignore
  const { chatId = '' } = options;
  return request(`/aikb/v1/chat/${chatId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 定制QA */
export async function getCustomQaData(params: any) {
  return request('/aikb/v1/qapair', {
    method: 'GET',
    params,
  });
}

/** 新增问答 POST /aikb/v1/qapair */
export async function addCustomQa(params: any) {
  return request('/aikb/v1/qapair', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

/** 修改问答 PUT /aikb/v1/qapair/{id} */
export async function updateCustomQa(id: string, params: any) {
  // @ts-ignore
  return request(`/aikb/v1/qapair/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

/** 删除问答 DELETE /aikb/v1/category/{categoryId} */
export async function deleteCustomQa(id: string) {
  // @ts-ignore
  return request(`/aikb/v1/qapair/${id}`, {
    method: 'DELETE',
  });
}

/** 获取训练列表 GET /aikb/v1/doc */
export async function getTrainData(params: any) {
  return request('/aikb/v1/train', {
    method: 'GET',
    params: params,
  });
}

/** 新增训练 POST /aikb/v1/qapair */
export async function addTrain(params: any) {
  return request('/aikb/v1/train', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

/** 编辑训练 POST /aikb/v1/qapair */
export async function editTrain(id: string, params: any) {
  return request(`/aikb/v1/train/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

/** 删除训练 DELETE */
export async function deleteTrain(id: string) {
  // @ts-ignore
  return request(`/aikb/v1/train/${id}`, {
    method: 'DELETE',
  });
}

/** 开始训练 */
export async function startTrain(id: string) {
  // @ts-ignore
  return request(`/aikb/v1/train/${id}/start`, {
    method: 'PUT',
  });
}

/** 停止训练 */
export async function stopTrain(id: string) {
  // @ts-ignore
  return request(`/aikb/v1/train/${id}/stop`, {
    method: 'PUT',
  });
}

/** 训练文档上传 POST */
export async function uploadTrainDocument(params: any, trainId: string) {
  return request(`/aikb/v1/train/${trainId}/file/upload`, {
    method: 'POST',
    headers: {
      // 'Content-Type': 'multipart/form-data',
    },
    transformRequest: [
      function (data, headers: any) {
        // 去除post请求默认的Content-Type
        delete headers.post['Content-Type'];
        return data;
      },
    ],
    data: params,
  });
}

/** 模型下载 POST */
export async function downloadTrainModel(id: string) {
  return request(`/aikb/v1/train/${id}/model/download`, {
    method: 'GET',
    // headers: {
    // 	'Content-Type': 'application/json',
    // },
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 新建规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'DELETE',
    ...(options || {}),
  });
}
