import {
  addTag,
  updateTag,
  deleteTag,
  getTagData,
} from '@/services/aikb/api';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Space, Table, ColorPicker } from 'antd';
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

// const formItemLayout = { labelCol: { span: 4 }, wrapperCol: { span: 14 } };

const TagList: React.FC = () => {
  const formRef = React.useRef<FormInstance>(null);
  const [form] = useForm();
  const [formInModal] = Form.useForm();
  const [tagData, setTagData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tagModalShow, setTagModalShow] = useState(false);
  const [actionType, setActionType] = useState('add');
  const [currentRecord, setCurrentRecord] = useState({});

  const handleUpdateTag = (action: string, record: any) => {
    const initFormValues = {
      question: action === 'add' ? '' : record.question,
      answer: action === 'add' ? '' : record.answer,
    };
    formInModal.setFieldsValue(initFormValues);
    setActionType(action);
    setTagModalShow(true);
    if (action === 'edit') {
      setCurrentRecord(record);
    }
  };

  const fetchTagData = (pageInfo: any, formValues: any) => {
    const { tagName = '', category = '' } = formValues || form.getFieldsValue();
    console.log('formValues', formValues);
    const params = {
      'category.id': category,
      name: tagName,
      page: pageInfo.page,
      size: pageInfo.size,
      sort: 'createdDate,desc',
    };
    getTagData(params)
      .then((res) => {
        console.log('标签列表res', res);
        setTagData(res.payload);
        setTotal(res.totalElements);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    console.log(page);
    setCurrentPage(page);
    const pageInfo = {
      page,
      size: pageSize,
    };
    fetchTagData(pageInfo, null);
  };

  const handleEditTag = (id: string) => {
    //
  };

  const handleDeleteTag = (id: string) => {
    deleteTag(id)
      .then(() => {
        message.success('文件删除成功');
        const pageInfo = {
          page: 1,
          size: 10,
        };
        fetchTagData(pageInfo, null);
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
    // fetchTagData(pageInfo, null);
  }, []);

  const columns: ColumnsType<DataType> = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      width: 350,
      render: (text) => <a>{text}</a>,
    },
    {
      title: '标签颜色',
      dataIndex: 'category',
      key: 'category',
      width: 90,
      render: (_, record) => <span>{record.category.name || '默认类目'}</span>,
    },
    {
      title: '标签备注',
      dataIndex: 'splitCount',
      key: 'splitCount',
      width: 90,
    },
    {
      title: '创建用户',
      dataIndex: 'splitStatus',
      key: 'splitStatus',
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
      width: 100,
      render: (_, record) => (
        <>
          <Space size="middle">
            <a
              onClick={() => {
                handleEditTag(record.id);
              }}
            >
              编辑
            </a>
          </Space>
          <Space size="middle">
            <a
              onClick={() => {
                handleDeleteTag(record.id);
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
    fetchTagData(pageInfo, formValues);
  };

  const handleTagOk = () => {
    console.log('formInModal value', formInModal.getFieldsValue());
    const { question, answer } = formInModal.getFieldsValue();
    const params = {
      question,
      answer,
    };

    const { id = '' } = currentRecord;

    if (actionType === 'add') {
      addTag(params)
        .then((res) => {
          console.log('定制QAres', res);
          message.success('添加成功');
          setTagModalShow(false);
          const pageInfo = {
            page: 1,
            size: 10,
          };
          fetchTagData(pageInfo, null);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      updateTag(id, params)
        .then((res) => {
          console.log('定制QAres', res);
          message.success('修改成功');
          setTagModalShow(false);
          const pageInfo = {
            page: 1,
            size: 10,
          };
          fetchTagData(pageInfo, null);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  return (
    <div className="tag-page">
      <h1>标签管理</h1>
      <div className="common-box query-box">
        <Form
          // {...formItemLayout}
          layout="inline"
          ref={formRef}
          form={form}
          name="control-ref"
          onFinish={onFinish}
        >
          <Form.Item name="tagName" label="标签名称">
            <Input style={{ width: 200 }} />
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
          icon={<PlusOutlined />}
          onClick={() => {
            handleUpdateTag('add', null);
          }}
        >
          创建标签
        </Button>
      </div>
      <div className="common-box">
        <Table
          bordered
          columns={columns}
          dataSource={tagData}
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
        title={actionType === 'add' ? '创建标签' : '修改标签'}
        open={tagModalShow}
        onCancel={() => {
          setTagModalShow(false);
        }}
        onOk={handleTagOk}
        width={660}
        className="create-tag-modal"
      >
        <div style={{ paddingTop: '10px' }}>
          <Form
            form={formInModal}
            name="control-ref"
            // onFinish={onAddQaFinish}
          >
            <Form.Item name="question" label="标签名称">
              <Input />
            </Form.Item>
            <Form.Item name="tagColor" label="标签颜色">
              <ColorPicker defaultValue="#1677ff" />
            </Form.Item>
            <Form.Item name="answer" label="标签备注">
              <Input.TextArea />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default TagList;
