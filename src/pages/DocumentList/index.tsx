import {
  deleteDocument,
  getCategoryData,
  getDocumentData,
  uploadDocument,
} from '@/services/aikb/api';
// import { arrayToTreeLoop } from '@/utils';
import { UnorderedListOutlined, UploadOutlined, SettingOutlined, PlusCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Form, Input, message, Modal, Space, Table, InputNumber, Select, Upload } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { useForm } from 'antd/es/form/Form';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import './index.less';

interface DataType {
  key: string;
  id: string;
  name: string;
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

const options = [
  {
    label: 'a10',
    value: 'a10',
  }, {
    label: 'b11',
    value: 'b11',
  }, {
    label: 'c12',
    value: 'c12'
  }
];

const DocumentList: React.FC = () => {
  const formRef = React.useRef<FormInstance>(null);
  const [form] = useForm();
  const [formInModal] = Form.useForm();

  // const [treeData, setTreeData] = useState([]);
  const [documentData, setDocumentData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedTags, setSelectedTags] = useState<String[]>([]);
  const [categoryModalShow, setCategoryModalShow] = useState(false);
  const [selectedUploadCategory, setSelectedUploadCategory] = useState({});
  const [currentUploadCategory, setCurrentUploadCategory] = useState({});
  const [selectedFileList, setSelectedFileList] = useState([]);
  let fileList = [];

  // const fetchCategoryData = () => {
  //   getCategoryData()
  //     .then((res) => {
  //       console.log('类目列表res', res);
  //       const treeData = arrayToTreeLoop(res.payload);
  //       // console.log('接口treeData', treeData);
  //       //@ts-ignore
  //       setTreeData(treeData);
  //     })
  //     .catch((error: any) => {
  //       console.log(error);
  //     });
  // };

  // useEffect(() => {
  //   fetchCategoryData();
  // }, []);

  const fetchDocumentData = (pageInfo: any, formValues: any) => {
    const { documentName = '', category = '' } = formValues || form.getFieldsValue();
    console.log('formValues', formValues);
    const params = {
      'category.id': category,
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
    formData.append(`categoryId`, currentUploadCategory.key);

    uploadDocument(formData)
      .then((res: any) => {
        message.success('上传成功');
        console.log('上传文档res', res);
        setSelectedFileList([]);
        // @ts-ignore
        setDocumentData([...documentData, ...res.payload]);
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
      width: 350,
      render: (text) => <a>{text}</a>,
    },
    {
      title: '类目名称',
      dataIndex: 'category',
      key: 'category',
      width: 90,
      render: (_, record) => <span>{record.category.name || '默认类目'}</span>,
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
      width: 180,
      render: (_, record) => (
        <>
          <Space size="middle">
            <a
              onClick={() => {
                handleDownloadFile(record.id);
              }}
            >
              下载
            </a>
          </Space>
          <Space size="middle">
            <a
              onClick={() => {
                handleDownloadFile(record.id);
              }}
              style={{ paddingLeft: '10px' }}
            >
              修改分片
            </a>
          </Space>
          <Space size="middle">
            <a
              onClick={() => {
                handleDownloadFile(record.id);
              }}
              style={{ paddingLeft: '10px' }}
            >
              分片详情
            </a>
          </Space>
          <Space size="middle">
            <a
              onClick={() => {
                handleDeleteFile(record.id);
              }}
              style={{ color: 'red', paddingLeft: '10px' }}
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

  const handleSelectTagChange = (newTagValue: string[]) => {
    console.log('newTagValue', newTagValue);
    setSelectedTags(newTagValue);
  };

  const handleSelectCategoryOk = () => {
    setCurrentUploadCategory(selectedUploadCategory);
    console.log('selectedUploadCategory', selectedUploadCategory);
    setCategoryModalShow(false);
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
          <Form.Item name="tag" label="标签">
            <Select
              mode="multiple"
              style={{ width: 200 }}
              placeholder="请选择标签"
              defaultValue={[]}
              // onChange={handleChange}
              options={options}
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
      <Button
          type="link"
          icon={<SettingOutlined />}
          onClick={() => {
            setCategoryModalShow(true);
          }}
        >
          上传文档设置
        </Button>
        <Upload {...props}>
          {/* @ts-ignore */}
          <Button
            type="link"
            icon={<UnorderedListOutlined />}
            disabled={selectedTags.length === 0}
          >
            选择文档
          </Button>
        </Upload>
        <Button type="link" icon={<UploadOutlined />} onClick={customRequest}>
          上传文档
        </Button>
        <span className="selected-upload-category-text">上传文档前请先选择标签和文档</span>
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
        title="文档设置"
        open={categoryModalShow}
        onCancel={() => {
          setCategoryModalShow(false);
        }}
        onOk={handleSelectCategoryOk}
        width={660}
        className="create-train-modal"
      >
        <div style={{ paddingTop: '10px' }}>
          <Form
            {...formInModalItemLayout}
            form={formInModal}
            name="control-ref"
            // onFinish={onAddQaFinish}
          >
            <Form.Item name="question" label="选择标签" rules={[{ required: true, message: '请选择标签!' }]}>
              <Select
                mode="multiple"
                // style={{ width: 200 }}
                placeholder="请选择标签"
                defaultValue={[]}
                // onChange={handleChange}
                options={options}
              />
            </Form.Item>
            <Form.Item name="splitLength" label="分段最大长度" rules={[{ required: true, message: '请设置分段最大长度!' }]}>
              <InputNumber min={1} max={100} defaultValue={3} />
            </Form.Item>
            <Form.Item name="answer" label="逐层分段标识符" rules={[{ required: true, message: '请选择逐层分段标识符!' }]}>
              <div>
                <Select
                  mode="multiple"
                  style={{ width: 200 }}
                  placeholder="请选择标签"
                  defaultValue={[]}
                  // onChange={handleChange}
                  options={options}
                />
                <Button type='text'>
                  <PlusCircleOutlined />
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentList;
