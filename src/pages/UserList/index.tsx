import { addUser, deleteUser, getUserData, updateUser, updatePassword, getRoleData } from '@/services/aikb/api';
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Space, Table, Select } from 'antd';
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
  const [editPasswordForm] = Form.useForm();
  const [queryForm] = Form.useForm();
  const [userModalShow, setUserModalShow] = useState(false);
  const [editPasswordModalShow, setEditPasswordModalShow] = useState(false);
  const [actionType, setActionType] = useState('add');
  const [currentPage, setCurrentPage] = useState(1);
  const [userDate, setUserData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentRecord, setCurrentRecord] = useState({});

  const handleUpdateUser = (action: string, record: any) => {
    const initFormValues = {
      username: action === 'add' ? '' : record.username,
      password: action === 'add' ? '' : record.password,
      phoneNumber: action === 'add' ? '' : record.phoneNumber,
      roles: action === 'add' ? [] : record.roleList?.map( (item: any) => item.id),
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
        console.log('用户res', res);
        setUserData(res.payload);
        setTotal(res.totalElements);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchRoleData = () => {
    const params = {
      name: '',
      sort: 'createdDate,desc',
    };

    getRoleData(params)
      .then((res) => {
        console.log('角色res', res);
        const roleData = res.payload.map((item: any) => {
          const obj = {
            value: item.id,
            label: item.name
          };
          return obj;
        });
        setRoleData(roleData);
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
          {/* <a
            onClick={() => {
              setCurrentRecord(record);
              setEditPasswordModalShow(true);
            }}
          >
            修改密码
          </a> */}
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
    fetchRoleData();
  }, []);

  const handleAddUserOk = () => {
    console.log('formInModal value', formInModal.getFieldsValue());
    const { username, password, phoneNumber = '', roles = [] } = formInModal.getFieldsValue();
    console.log('已选择roles', roles);
    if (actionType === 'add' && (!username || !password)) {
      message.warning('用户名和密码不能为空');
      return;
    }
    if (actionType !== 'add' && !username) {
      message.warning('用户名不能为空');
      return;
    }
    const roleIds = roles.map((item: number) => {
      const obj = {
        id: item,
      };
      return obj;
    });
    const params = {
      name: 'admin',
      username,
      password,
      phoneNumber: phoneNumber ? phoneNumber.toString() : '',
      roleList: roleIds
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
            page: currentPage,
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

  const handleUpdatePasswordOk = () => {
    console.log('formInModal value', editPasswordForm.getFieldsValue());
    const { oldPasswrod, newPasswrod } = editPasswordForm.getFieldsValue();
    if (!oldPasswrod || !newPasswrod) {
      message.warning('原密码和新密码不能为空');
      return;
    }
    const params = {
      oldPasswrod,
      newPasswrod,
    };

    updatePassword(params)
        .then((res) => {
          message.success('修改成功');
          setEditPasswordModalShow(false);
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
          dataSource={userDate}
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
            <Form.Item name="phoneNumber" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
              <Input placeholder='请输入手机号' />
            </Form.Item>
            <Form.Item name="roles" label="角&nbsp; &nbsp;&nbsp;色" rules={[{ required: true, message: '请选择角色' }]}>
              <Select
                mode="multiple"
                // style={{ width: 200 }}
                placeholder="请选择角色"
                defaultValue={[]}
                // onChange={handleChange}
                options={roleData}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <Modal
        title="修改密码"
        open={editPasswordModalShow}
        onCancel={() => {
          setEditPasswordModalShow(false);
        }}
        onOk={handleUpdatePasswordOk}
      >
        <div style={{ paddingTop: '10px' }}>
          <Form
            form={editPasswordForm}
            name="control-ref"
          >
            <Form.Item name="oldPasswrod" label="原密码" rules={[{ required: true, message: '请输入原密码' }]}>
              <Input placeholder='请输入原密码' />
            </Form.Item>
            <Form.Item name="newPasswrod" label="新密码" rules={[{ required: true, message: '请输入新密码' }]}>
              <Input placeholder='请输入新密码' />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;
