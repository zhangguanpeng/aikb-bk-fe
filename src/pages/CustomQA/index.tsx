import {
  addCustomQa,
  deleteCustomQa,
  getCustomQaData,
  updateCustomQa,
  uploadQaDocument,
  uploadQaImage,
  getTagData
} from '@/services/aikb/api';
import { PlusOutlined, UploadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Form, Input, message, Modal, Space, Table, Upload, Flex, Tag, Select, Tooltip } from 'antd';
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
  const [tagData, setTagData] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentRecord, setCurrentRecord] = useState({});
  const [splitContent, setSplitContent] = useState('');
  const [shortAnswer, setShortAnswer] = useState('');
  // const [selectedFileList, setSelectedFileList] = useState([]);
  // let fileList = [];

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

  const fetchQaData = (pageInfo: any) => {
    const queryParams = queryForm.getFieldsValue();
    const params = {
      id: '',
      question: queryParams ? queryParams.questionDesc : '',
      answer: '',
      ...pageInfo,
      sort: 'createdDate,ASC',
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
      shortAnswer: action === 'add' ? '' : record.shortAnswer,
      tagIds: action === 'add' ? [] : record.tags?.map((item: any) => item.id),
    };
    formInModal.setFieldsValue(initFormValues);
    setSplitContent('');
    setShortAnswer('');
    setActionType(action);
    setQaModalShow(true);
    if (action === 'edit') {
      setCurrentRecord(record);
      setSplitContent(record.answer);
      setShortAnswer(record.shortAnswer || '');
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
      title: '简要回答',
      dataIndex: 'shortAnswer',
      key: 'shortAnswer',
      width: 300,
      render: (text, record) => (
        <div>
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {text && text.length > 500 ? `${text.substr(0, 200)}...` : text}
          </ReactMarkdown>
        </div>
      ),
    },
    {
      title: '详细回答',
      dataIndex: 'answer',
      key: 'answer',
      width: 300,
      render: (text, record) => (
        <div>
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {text.length > 500 ? `${text.substr(0, 200)}...` : text}
          </ReactMarkdown>
        </div>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
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
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record: any) => (
        <Space size="middle">
          <a
            onClick={() => {
              handleUpdateQa('edit', record);
            }}
          >
            编辑/查看详情
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
    fetchTagData();
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

  const onUploadImgInShort = async (files: any, callback: any) => {
    let formData = new FormData();
    files.forEach((file: any) => {
      formData.append(`imageList`, file);
    });
    // formData.append(`imageList`, file);
    uploadQaImage(formData)
      .then((res: any) => {
        console.log('上传图片res', res);
        message.success('上传成功');
        let newShortAnswer = shortAnswer;
        res.payload.forEach((imgItem: any) => {
          newShortAnswer += `![](aikb/v1/qapair/image/${imgItem.oriImageFileUrl})`;
        });
        setShortAnswer(newShortAnswer || '');
      })
      .catch(() => {
        message.error('上传失败');
      }
    );
  };

  const handleAddQaOk = () => {
    console.log('formInModal value', formInModal.getFieldsValue());
    const { question, tagIds } = formInModal.getFieldsValue();
    const params = {
      question,
      shortAnswer,
      answer: splitContent,
      tagIds
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
        <Tooltip title="上传word文档按照：@@@问题1@@@简要答案1@@@详细答案1的顺序和特殊符号形式依次添加">
          <span><QuestionCircleOutlined /></span>
        </Tooltip>
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
        width={880}
      >
        <div style={{ paddingTop: '10px' }}>
          <Form
            form={formInModal}
            name="control-ref"
            // onFinish={onAddQaFinish}
            labelCol={{ span: 2 }}
          >
            <Form.Item name="question" label="问题">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="tagIds" label="选择标签">
              <Select
                mode="multiple"
                placeholder="请选择标签"
                defaultValue={[]}
                options={tagData}
              />
            </Form.Item>
            <Form.Item name="shortAnswer" label="简要回答">
              <MdEditor
                modelValue={shortAnswer}
                onChange={(value) => {
                  setShortAnswer(value);
                }}
                toolbars={['image']}
                noImgZoomIn
                onUploadImg={onUploadImgInShort}
              />
            </Form.Item>
            <Form.Item name="answer" label="详细回答">
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
