import {
  deleteDocument,
  getTagData,
  getDocumentData,
  uploadDocument,
  updateDocTag,
  updateDocStrategy
} from '@/services/aikb/api';
// import { arrayToTreeLoop } from '@/utils';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Form, Input, message, Modal, Space, Table, InputNumber, Select, Upload, Flex, Tag } from 'antd';
import { history } from '@umijs/max';
import type { FormInstance } from 'antd/es/form';
import { useForm } from 'antd/es/form/Form';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import './index.less';

interface DataType {
  key: string;
  id: string;
  name: string;
  tagIds: string;  // 标签
  algorithm: string; // 分片算法
  splitStatus: string; // 分片状态，FRESH：未处理，SPLITTING：分片中，SPLIT_COMPLETED：分片完成
  splitCount: string; // 分片数
  tokenNumber: string; // token数
  splitAlgorithm: string; // 分片算法
  fileId: string;
  fileSize: string;
  docHtmlUrl: string; // 文档html地址，用于超链接打开
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
  category: {
    id: string; // 类目id
    name: string; // 类目名称
  };
}

const formInModalItemLayout = { labelCol: { span: 5 }, wrapperCol: { span: 19 } };

const splitAlgorithmOptions = [
  {
    label: '默认算法',
    value: 'default',
  }
]

const DocumentList: React.FC = () => {
  const formRef = React.useRef<FormInstance>(null);
  const [form] = useForm();
  const [formInModal] = Form.useForm();
  const [formInEditTagModal] = Form.useForm();
  const [formInEditStrategyModal] = Form.useForm();
  const [documentData, setDocumentData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tagData, setTagData] = useState([]);
  const [selectedTags, setSelectedTags] = useState<String[]>([]);
  const [documentSettingModalShow, setDocumentSettingModalShow] = useState(false);
  const [editTagModalShow, setEditTagModalShow] = useState(false);
  const [editStrategyModalShow, setEditStrategyModalShow] = useState(false);
  const [currentRecord, setCurrentRecord] = useState({});
  const [currentUploadCategory, setCurrentUploadCategory] = useState({});
  const [selectedFileList, setSelectedFileList] = useState([]);
  let fileList = [];

  const fetchTagData = () => {
    const params = {
      id: '',
      name: '',
      page: 1,
      size: 100,
      sort: 'createdDate,desc',
    };
    getTagData(params)
      .then((res) => {
        console.log('标签列表res', res);
        const tagData = res.payload.map((item: any) => {
          const option = {
            label: item.name,
            value: item.id
          };
          return option
        });
        setTagData(tagData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    fetchTagData();
  }, []);

  const fetchDocumentData = (pageInfo: any, formValues: any) => {
    const { documentName = '', tags = [] } = formValues || form.getFieldsValue();
    console.log('formValues', formValues);
    const params = {
      'tags.id': tags.join(','),
      name: documentName,
      page: pageInfo.page,
      size: pageInfo.size,
      sort: 'createdDate,desc',
    };
    getDocumentData(params)
      .then((res) => {
        console.log('文档列表res', res);
        setDocumentData(res.payload);
        setTotal(res.totalElements);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const customRequest = () => {
    console.log('formInModal', formInModal.getFieldsValue());
    const { tagIds, algorithm = 'default' } = formInModal.getFieldsValue();
    console.log('selectedFileList', selectedFileList);
    if (selectedFileList.length < 1) {
      message.warning('请先选择文档');
      return false;
    }
    let formData = new FormData();
    selectedFileList.forEach((file: any) => {
      formData.append(`documentList`, file);
    });
    // @ts-ignore
    // formData.append(`categoryId`, currentUploadCategory.key);
    formData.append(`algorithm`, algorithm);
    formData.append(`tagIds`, tagIds);

    uploadDocument(formData)
      .then((res: any) => {
        message.success('上传成功');
        console.log('上传文档res', res);
        setSelectedFileList([]);
        // @ts-ignore
        // setDocumentData([...documentData, ...res.payload]);
        setDocumentSettingModalShow(false);
        const pageInfo = {
          page: 1,
          size: 10,
        };
        fetchDocumentData(pageInfo, null);
      })
      .catch(() => {
        message.error('上传失败');
        setSelectedFileList([]);
      });
  };

  const props: UploadProps = {
    name: 'file',
    accept: '.doc,.docx,.pdf',
    beforeUpload: (file) => {
      console.log('beforeUpload file', file);
      // @ts-ignore
      fileList = [...fileList, file];
      // @ts-ignore
      setSelectedFileList(fileList);
      console.log('fileList', fileList);
      return false;
    },
    customRequest(info: any) {
      console.log('upload info', info);

      const params = {
        // @ts-ignore
        categoryId: currentUploadCategory.key,
        documentList: info.file,
      };
      uploadDocument(params)
        .then(() => {
          message.success(`${info.file.name} 上传成功`);
          const pageInfo = {
            page: 1,
            size: 10,
          };
          fetchDocumentData(pageInfo, null);
        })
        .catch(() => {
          message.error(`${info.file.name} 上传失败.`);
        });
    },
    maxCount: 50,
    showUploadList: true,
    multiple: true,
    fileList: selectedFileList,
  };

  const handlePageChange = (page: number, pageSize: number) => {
    console.log(page);
    setCurrentPage(page);
    const pageInfo = {
      page,
      size: pageSize,
    };
    fetchDocumentData(pageInfo, null);
  };

  const downloadFile = (url: string) => {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadFile = (id: string) => {
    downloadFile(`/aikb/v1/doc/download?id=${id}`);
  };

  const handleDeleteFile = (id: string) => {
    deleteDocument(id)
      .then(() => {
        message.success('文件删除成功');
        const pageInfo = {
          page: 1,
          size: 10,
        };
        fetchDocumentData(pageInfo, null);
      })
      .catch(() => {
        message.error('文件删除失败');
      });
  };

  useEffect(() => {
    const pageInfo = {
      page: 1,
      size: 10,
    };
    fetchDocumentData(pageInfo, null);
  }, []);


  const columns: ColumnsType<DataType> = [
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (text) => <a>{text}</a>,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 50,
      render: (text, record) => (
        <Flex gap="4px 0" wrap>
          {
            record.tags && record.tags.length > 0 && record.tags.map((tagItem: any) => (
              <Tag color={tagItem.color}>{tagItem.name}</Tag>
            ))
          }
        </Flex>
      ),
    },
    {
      title: '分片数',
      dataIndex: 'splitCount',
      key: 'splitCount',
      width: 90,
    },
    {
      title: '分片状态',
      dataIndex: 'splitStatus',
      key: 'splitStatus',
      width: 90,
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 90,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <>
          <Space size="middle">
            <a
              onClick={() => {
                const initFormValues = {
                  tagIds: record.tags ? record.tags.map((item: any) => item.id) : []
                };
                formInEditTagModal.setFieldsValue(initFormValues);
                setCurrentRecord(record);
                setEditTagModalShow(true);
              }}
              style={{ paddingRight: '10px' }}
            >
              修改标签
            </a>
          </Space>
          <Space size="middle">
            <a
              onClick={() => {
                const initFormValues = {
                  algorithm: record.algorithm
                };
                formInEditStrategyModal.setFieldsValue(initFormValues);
                setCurrentRecord(record);
                setEditStrategyModalShow(true);
              }}
              style={{ paddingRight: '10px' }}
            >
              修改策略
            </a>
          </Space>
          <Space size="middle">
            <a
              onClick={() => {
                // handleDownloadFile(record.id);
                history.push('/splitlist', { documentId: record.id })
              }}
              style={{ paddingRight: '10px' }}
            >
              分片详情
            </a>
          </Space>
          <Space size="middle">
            <a
              onClick={() => {
                handleDownloadFile(record.id);
              }}
              style={{ paddingRight: '10px' }}
            >
              下载
            </a>
          </Space>
          <Space size="middle">
            <a
              onClick={() => {
                handleDeleteFile(record.id);
              }}
              style={{ color: 'red', paddingRight: '10px' }}
            >
              删除
            </a>
          </Space>
        </>
      ),
    },
  ];

  const onFinish = (formValues: any) => {
    const pageInfo = {
      page: 1,
      size: 10,
    };
    fetchDocumentData(pageInfo, formValues);
  };

  const handleEditTagOk = () => {
    const { tagIds } = formInEditTagModal.getFieldsValue();
    console.log('tagIds', tagIds);
    // @ts-ignore
    updateDocTag(currentRecord.id, { tagIds: tagIds.join(',') }).then(res => {
      message.success('修改成功');
      const pageInfo = {
        page: 1,
        size: 10,
      };
      fetchDocumentData(pageInfo, null);
      setEditTagModalShow(false);
    }).catch(error => {
      message.error('修改失败');
      //
    })
    
  };

  const handleEditStrategyOk = () => {
    const { algorithm } = formInEditStrategyModal.getFieldsValue();
    // @ts-ignore
    updateDocStrategy(currentRecord.id, { algorithm }).then(res => {
      message.success('修改成功');
      const pageInfo = {
        page: 1,
        size: 10,
      };
      fetchDocumentData(pageInfo, null);
      setEditStrategyModalShow(false);
    }).catch(error => {
      message.error('修改失败');
      //
    })
    
  };

  return (
    <div className="document-page">
      <h1>文档管理</h1>
      <div className="common-box query-box">
        <Form
          // {...formItemLayout}
          layout="inline"
          ref={formRef}
          form={form}
          name="control-ref"
          onFinish={onFinish}
        >
          <Form.Item name="documentName" label="文档名称">
            <Input style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select
              mode="multiple"
              style={{ width: 200 }}
              placeholder="请选择标签"
              defaultValue={[]}
              // onChange={handleChange}
              options={tagData}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className="btn-box">
        <Button type="link" icon={<UploadOutlined />} onClick={() => {
            setDocumentSettingModalShow(true);
          }}
        >
          上传文档
        </Button>
      </div>
      <div className="common-box">
        <Table
          bordered
          columns={columns}
          dataSource={documentData}
          rowKey={(record: any) => record.id}
          pagination={{
            showTotal: () => {
              return `共有${total}条数据`;
            },
            showSizeChanger: true,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange,
            current: currentPage,
            total,
          }}
          scroll={{
            x: true,
          }}
        />
      </div>
      <Modal
        title="上传文档"
        open={documentSettingModalShow}
        onCancel={() => {
          setDocumentSettingModalShow(false);
        }}
        onOk={customRequest}
        width={660}
        className="create-train-modal"
      >
        <div style={{ paddingTop: '10px' }}>
          <Form
            {...formInModalItemLayout}
            form={formInModal}
            name="control-ref"
          >
            <Form.Item name="tagIds" label="选择标签" rules={[{ required: true, message: '请选择标签!' }]}>
              <Select
                mode="multiple"
                placeholder="请选择标签"
                defaultValue={[]}
                options={tagData}
              />
            </Form.Item>
            <Form.Item name="algorithm" label="选择切片算法" rules={[{ required: true, message: '请选择切片算法!' }]}>
              <Select
                placeholder="请选择切片算法"
                options={splitAlgorithmOptions}
              />
            </Form.Item> 
            <Form.Item name="upload" label="选择文档" rules={[{ required: true, message: '请选择文档!' }]}>
              <Upload {...props}>
                {/* @ts-ignore */}
                <Button
                  icon={<UploadOutlined />}
                >
                  选择
                </Button>
              </Upload>
            </Form.Item>
            
          </Form>
        </div>
      </Modal>
      <Modal
        title="修改标签"
        open={editTagModalShow}
        onCancel={() => {
          setEditTagModalShow(false);
        }}
        onOk={handleEditTagOk}
        width={660}
      >
        <div style={{ paddingTop: '10px' }}>
        <Form
            {...formInModalItemLayout}
            form={formInEditTagModal}
          >
            <Form.Item name="tagIds" label="选择标签" rules={[{ required: true, message: '请选择标签!' }]}>
              <Select
                mode="multiple"
                placeholder="请选择标签"
                defaultValue={[]}
                options={tagData}
              />
            </Form.Item>           
          </Form>
        </div>
      </Modal>
      <Modal
        title="修改策略"
        open={editStrategyModalShow}
        onCancel={() => {
          setEditStrategyModalShow(false);
        }}
        onOk={handleEditStrategyOk}
        width={660}
      >
        <div style={{ paddingTop: '10px' }}>
          <Form
            {...formInModalItemLayout}
            form={formInEditStrategyModal}
          >
            <Form.Item name="algorithm" label="选择切片算法" rules={[{ required: true, message: '请选择切片算法!' }]}>
              <Select
                placeholder="请选择切片算法"
                options={splitAlgorithmOptions}
              />
            </Form.Item>           
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentList;
