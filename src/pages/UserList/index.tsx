import { addUser, deleteUser, getUserData, updateUser } from '@/services/aikb/api';
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Space, Table } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import './index.less';

const { confirm } = Modal;

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const UserList: React.FC = () => {
  const formRef = React.useRef<FormInstance>(null);
  const [formInModal] = Form.useForm();
  const [queryForm] = Form.useForm();
  const [userModalShow, setUserModalShow] = useState(false);
  const [actionType, setActionType] = useState('add');
  const [currentPage, setCurrentPage] = useState(1);
  const [qaData, setQaData] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentRecord, setCurrentRecord] = useState({});

  const handleUpdateUser = (action: string, record: any) => {
    const initFormValues = {
      username: action === 'add' ? '' : record.username,
      password: action === 'add' ? '' : record.password,
    };
    formInModal.setFieldsValue(initFormValues);
    setActionType(action);
    setUserModalShow(true);
    if (action === 'edit') {
      setCurrentRecord(record);
    }
  };

  const fetchUserData = (pageInfo: any) => {
    const queryParams = queryForm.getFieldsValue();
    const params = {
      id: '',
      // password: queryParams ? queryParams.questionDesc : '',
      username: queryParams && queryParams.username ? queryParams.username : '',
      // username: '',
      ...pageInfo,
      sort: 'createdDate,desc',
    };

    getUserData(params)
      .then((res) => {
        console.log('定制QAres', res);
        setQaData(res.payload);
        setTotal(res.totalElements);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDeleteUser = (id: string) => {
    deleteUser(id)
      .then(() => {
        message.success('删除成功');
        const pageInfo = {
          page: 1,
          size: 10,
        };
        fetchUserData(pageInfo);
      })
      .catch(() => {
        message.error('删除失败');
      });
  };

  const showDeleteConfirm = (id: string) => {
    confirm({
      title: '确定要删除该用户吗？',
      icon: <ExclamationCircleFilled />,
      content: '',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        console.log('OK');
        handleDeleteUser(id);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 400,
      // render: (text) => <a>{text}</a>,
    },
    {
      title: '角色',
      dataIndex: 'rolename',
      key: 'rolename',
      render: (_, record: any) => (
        <span>{record.roleList ? record.roleList[0].name : '普通用户'}</span>
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
              handleUpdateUser('edit', record);
            }}
          >
            编辑
          </a>
          <a
            style={{ color: 'red' }}
            onClick={() => {
              showDeleteConfirm(record.id);
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
    fetchUserData(pageInfo);
  }, []);

  const handleAddUserOk = () => {
    console.log('formInModal value', formInModal.getFieldsValue());
    const { username, password } = formInModal.getFieldsValue();
    if (!username || !password) {
      message.warning('用户名和密码不能为空');
      return;
    }
    const params = {
      username,
      password,
    };

    const { id = '' } = currentRecord;

    if (actionType === 'add') {
      addUser(params)
        .then((res) => {
          message.success('添加成功');
          setUserModalShow(false);
          const pageInfo = {
            page: 1,
            size: 10,
          };
          fetchUserData(pageInfo);
        })
        .catch((error) => {
          console.log(error);
          message.error({
            content: `添加失败：${error.response.data.code}`,
            style: {width: '600px', margin: '0 auto'}
          });
        });
    } else {
      updateUser(id, params)
        .then((res) => {
          message.success('修改成功');
          setUserModalShow(false);
          const pageInfo = {
            page: 1,
            size: 10,
          };
          fetchUserData(pageInfo);
        })
        .catch((error) => {
          console.log(error);
          message.error({
            content: `修改失败：${error.response.data.code}`,
            style: {width: '600px', margin: '0 auto'}
          });
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
    fetchUserData(pageInfo);
  };

  const onQueryFinish = (values: any) => {
    console.log(values);
    const pageInfo = {
      page: 1,
      size: 10,
    };
    fetchUserData(pageInfo);
  };

  return (
    <div className="customqa-page">
      <h1>用户管理</h1>
      <div className="common-box query-box">
        <Form
          // {...formItemLayout}
          layout="inline"
          ref={formRef}
          form={queryForm}
          name="control-ref"
          onFinish={onQueryFinish}
        >
          <Form.Item name="username" label="用户名">
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
            handleUpdateUser('add', null);
          }}
        >
          添加用户
        </Button>
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
        title={actionType === 'add' ? '增加用户' : '修改用户'}
        open={userModalShow}
        onCancel={() => {
          setUserModalShow(false);
        }}
        onOk={handleAddUserOk}
      >
        <div style={{ paddingTop: '10px' }}>
          <Form
            form={formInModal}
            name="control-ref"
          >
            <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input placeholder='请输入用户名' />
            </Form.Item>
            <Form.Item name="password" label="密&nbsp; &nbsp;&nbsp;码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input placeholder='请输入密码' />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;
