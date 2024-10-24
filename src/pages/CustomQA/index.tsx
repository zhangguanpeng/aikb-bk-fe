import {
  addCustomQa,
  deleteCustomQa,
  getCustomQaData,
  updateCustomQa,
  uploadQaDocument,
  uploadQaImage,
} from '@/services/aikb/api';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Form, Input, message, Modal, Space, Table, Upload } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { ColumnsType } from 'antd/es/table';
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import './index.less';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const CustomQA: React.FC = () => {
  const formRef = React.useRef<FormInstance>(null);
  const [formInModal] = Form.useForm();
  const [queryForm] = Form.useForm();
  const [qaModalShow, setQaModalShow] = useState(false);
  const [actionType, setActionType] = useState('add');
  const [currentPage, setCurrentPage] = useState(1);
  const [qaData, setQaData] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentRecord, setCurrentRecord] = useState({});
  const [splitContent, setSplitContent] = useState('');
  // const [selectedFileList, setSelectedFileList] = useState([]);
  // let fileList = [];

  const fetchQaData = (pageInfo: any) => {
    const queryParams = queryForm.getFieldsValue();
    const params = {
      id: '',
      question: queryParams ? queryParams.questionDesc : '',
      answer: '',
      ...pageInfo,
      sort: 'createdDate,desc',
    };

    getCustomQaData(params)
      .then((res) => {
        console.log('定制QAres', res);
        setQaData(res.payload);
        setTotal(res.totalElements);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const customRequest = (fileList: any) => {
    // console.log('selectedFileList', selectedFileList);
    if (fileList.length < 1) {
      message.warning('请先选择文档');
      return false;
    }
    let formData = new FormData();
    fileList.forEach((file: any) => {
      formData.append(`fileList`, file);
    });

    uploadQaDocument(formData)
      .then((res: any) => {
        message.success('上传成功');
        console.log('上传文档res', res);
        // setSelectedFileList([]);
        // @ts-ignore
        const pageInfo = {
          page: 1,
          size: 10,
        };
        fetchQaData(pageInfo);
      })
      .catch(() => {
        message.error('上传失败');
        // setSelectedFileList([]);
      });
  };

  const uploadQaProps: UploadProps = {
    name: 'file',
    accept: '.xls, .xlsx, .doc, .docx',
    beforeUpload: (file) => {
      console.log('beforeUpload file', file);
      // @ts-ignore
      // fileList = [...fileList, file];
      // @ts-ignore
      // setSelectedFileList(fileList);
      customRequest([file]);
      return false;
    },
    maxCount: 50,
    showUploadList: false,
    multiple: false,
    // fileList: selectedFileList,
  };

  const handleUpdateQa = (action: string, record: any) => {
    const initFormValues = {
      question: action === 'add' ? '' : record.question,
      answer: action === 'add' ? '' : record.answer,
    };
    formInModal.setFieldsValue(initFormValues);
    setSplitContent('');
    setActionType(action);
    setQaModalShow(true);
    if (action === 'edit') {
      setCurrentRecord(record);
      setSplitContent(record.answer);
    }
  };

  const handleDeleteQa = (id: string) => {
    deleteCustomQa(id)
      .then(() => {
        message.success('删除成功');
        const pageInfo = {
          page: 1,
          size: 10,
        };
        setCurrentPage(1);
        fetchQaData(pageInfo);
      })
      .catch(() => {
        message.error('删除失败');
      });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: '问题描述',
      dataIndex: 'question',
      key: 'name',
      width: 200,
      // render: (text) => <a>{text}</a>,
    },
    {
      title: '回答',
      dataIndex: 'answer',
      key: 'answer',
      render: (text) => (
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {text}
        </ReactMarkdown>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: any) => (
        <Space size="middle">
          <a
            onClick={() => {
              handleUpdateQa('edit', record);
            }}
          >
            编辑
          </a>
          <a
            style={{ color: 'red' }}
            onClick={() => {
              handleDeleteQa(record.id);
            }}
          >
            删除
          </a>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const pageInfo = {
      page: 1,
      size: 10,
    };
    fetchQaData(pageInfo);
  }, []);

  const onUploadImg = async (files: any, callback: any) => {
    let formData = new FormData();
    files.forEach((file: any) => {
      formData.append(`imageList`, file);
    });
    // formData.append(`imageList`, file);
    uploadQaImage(formData)
      .then((res: any) => {
        console.log('上传图片res', res);
        message.success('上传成功');
        let newSplitContent = splitContent;
        res.payload.forEach((imgItem: any) => {
          newSplitContent += `![](aikb/v1/qapair/image/${imgItem.oriImageFileUrl})`;
        });
        setSplitContent(newSplitContent);
      })
      .catch(() => {
        message.error('上传失败');
      }
    );
  };

  const handleAddQaOk = () => {
    console.log('formInModal value', formInModal.getFieldsValue());
    const { question } = formInModal.getFieldsValue();
    const params = {
      question,
      answer: splitContent,
    };

    const { id = '' } = currentRecord;

    if (actionType === 'add') {
      addCustomQa(params)
        .then((res) => {
          console.log('定制QAres', res);
          message.success('添加成功');
          setQaModalShow(false);
          const pageInfo = {
            page: 1,
            size: 10,
          };
          fetchQaData(pageInfo);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      updateCustomQa(id, params)
        .then((res) => {
          console.log('定制QAres', res);
          message.success('修改成功');
          setQaModalShow(false);
          const pageInfo = {
            page: currentPage,
            size: 10,
          };
          fetchQaData(pageInfo);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handlePageChange = (page: number, pageSize: number) => {
    console.log(page);
    setCurrentPage(page);
    const pageInfo = {
      page,
      size: pageSize,
    };
    fetchQaData(pageInfo);
  };

  const onQueryFinish = (values: any) => {
    console.log(values);
    const pageInfo = {
      page: 1,
      size: 10,
    };
    fetchQaData(pageInfo);
  };

  return (
    <div className="customqa-page">
      <h1>定制QA</h1>
      <div className="common-box query-box">
        <Form
          // {...formItemLayout}
          layout="inline"
          ref={formRef}
          form={queryForm}
          name="control-ref"
          onFinish={onQueryFinish}
        >
          <Form.Item name="questionDesc" label="问题描述">
            <Input style={{ width: 200 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            {/* <Button htmlType="button" onClick={onReset}>
							Reset
						</Button> */}
          </Form.Item>
        </Form>
      </div>
      <div className="btn-box">
        <Button
          type="link"
          icon={<PlusOutlined />}
          onClick={() => {
            handleUpdateQa('add', null);
          }}
        >
          添加问答
        </Button>
        <Upload {...uploadQaProps}>
          {/* @ts-ignore */}
          <Button type='link' icon={<UploadOutlined />}>上传问答对</Button>
        </Upload>
      </div>
      <div className="common-box">
        <Table
          columns={columns}
          dataSource={qaData}
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
        />
      </div>
      <Modal
        title={actionType === 'add' ? '增加问答' : '修改问答'}
        open={qaModalShow}
        onCancel={() => {
          setQaModalShow(false);
        }}
        onOk={handleAddQaOk}
        width={800}
      >
        <div style={{ paddingTop: '10px' }}>
          <Form
            form={formInModal}
            name="control-ref"
            // onFinish={onAddQaFinish}
          >
            <Form.Item name="question" label="问题">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="answer" label="回答">
              {/* <Input.TextArea /> */}
              <MdEditor
                modelValue={splitContent}
                onChange={(value) => {
                  setSplitContent(value);
                }}
                toolbars={['image']}
                noImgZoomIn
                onUploadImg={onUploadImg}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default CustomQA;
