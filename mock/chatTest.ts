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
    'GET /aikb/v1/search': (req: Request, res: Response) => {
      res.send({
        success: true,
        payload:[
            {
                content: "string，内容，如果是文本的则返回文本内容，如果是图片则返回图片链接",
                imageList: [
                    {
                        url: "string，图片链接",
                        size: {
                            width: "int, 图片宽度",
                            height: "int, 图片高度"
                        }
                    }
                ],
                reference: [
                    //出自的文档列表
                    {
                        title: "string,文档标题",
                        url: "string，文档链接,用于网页端打开",
                        downloadUrl: "string, 下载链接，用于文档下载",
                        content: "string, 文档片段的内容"
                    }
                ]
            }
        ]
      });
    },
  };