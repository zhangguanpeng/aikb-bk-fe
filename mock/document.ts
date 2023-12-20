import { Request, Response } from 'express';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

async function getFakeCaptcha(req: Request, res: Response) {
  await waitTime(2000);
  return res.json('captcha-xxx');
}

const { ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION } = process.env;

/**
 * 当前用户的权限，如果为空代表没登录
 * current user access， if is '', user need login
 * 如果是 pro 的预览，默认是有权限的
 */
let access = ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site' ? 'admin' : '';

const getAccess = () => {
  return access;
};

// 代码中会兼容本地 service mock 以及部署站点的静态数据
export default {
    // 支持值为 Object 和 Array
    'GET /aikb/v1/doc': (req: Request, res: Response) => {
      res.send({
        success: true,
        result:[
            {
                id: "1",
                name:"动物大全",
                splitStatus: "1", // 分片状态，FRESH：未处理，SPLITTING：分片中，SPLIT_COMPLETED：分片完成
                splitCount: "2", // 分片数
                tokenNumber: "2", // token数
                splitAlgorithm: "33", // 分片算法
                fileId: "11",
                fileSize: "1024",
                docHtmlUrl: "qq", // 文档html地址，用于超链接打开
                createdAt: "2023-11-01", // 创建时间 
                updatedAt: "2023-11-01", // 更新时间
                category: {
                    id: "1", // 类目id
                    name: "组织部" // 类目名称
                }
            }
        ]
      });
    },
  };