import { addRole, deleteRole, getRoleData, updateRole, getRoleTypeData } from '@/services/aikb/api';
import { PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Space, Table, Select } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import './index.less';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const { confirm } = Modal;

const RoleList: React.FC = () => {
  const formRef = React.useRef<FormInstance>(null);
  const [formInModal] = Form.useForm();
  const [queryForm] = Form.useForm();
  const [roleModalShow, setRoleModalShow] = useState(false);
  const [actionType, setActionType] = useState('add');
  const [currentPage, setCurrentPage] = useState(1);
  const [roleData, setRoleData] = useState([]);
  const [roleTypeData, setRoleTypeData] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentRecord, setCurrentRecord] = useState({});

  const handleUpdateRole = (action: string, record: any) => {
    const initFormValues = {
      name: action === 'add' ? '' : record.name,
      code: action === 'add' ? '' : record.code || '',
      type: action === 'add' ? '' : record.type
    };
    formInModal.setFieldsValue(initFormValues);
    setActionType(action);
    setRoleModalShow(true);
    if (action === 'edit') {
      setCurrentRecord(record);
    }
  };

  const fetchRoleData = (pageInfo: any) => {
    const queryParams = queryForm.getFieldsValue();
    const params = {
      name: queryParams ? queryParams.name : '',
      // ...pageInfo,
      sort: 'createdDate,desc',
    };

    getRoleData(params)
      .then((res) => {
        console.log('角色res', res);
        setRoleData(res.payload);
        setTotal(res.totalElements);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchRoleTypeData = () => {
    getRoleTypeData()
      .then((res) => {
        console.log('角色类型res', res);
        const { payload = [] } = res;
        const formattedRoleTypeData = payload.map((item: string) => {
          const option = {
            label: item,
            value: item,
          };
          return option;
        })
        setRoleTypeData(formattedRoleTypeData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDeleteRole = (id: string) => {
    deleteRole(id)
      .then(() => {
        message.success('删除成功');
        const pageInfo = {
          page: 1,
          size: 10,
        };
        setCurrentPage(1);
        fetchRoleData(pageInfo);
      })
      .catch(() => {
        message.error('删除失败');
      });
  };

  const showDeleteConfirm = (id: string) => {
    confirm({
      title: '确定要删除该角色吗？',
      icon: <ExclamationCircleFilled />,
      content: '',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        console.log('OK');
        handleDeleteRole(id);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      // render: (text) => <a>{text}</a>,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: '角色类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: any) => (
        <Space size="middle">
          <a
            onClick={() => {
              handleUpdateRole('edit', record);
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
    fetchRoleData(pageInfo);
    fetchRoleTypeData();
  }, []);

  const handleAddRoleOk = () => {
    console.log('formInModal value', formInModal.getFieldsValue());
    const { name, code, type } = formInModal.getFieldsValue();
    if (!name) {
      message.warning('请输入有效角色名称');
      return false;
    }

    if (!code) {
      message.warning('请输入有效角色编码');
      return false;
    }
    
    const params = {
      name,
      code,
      type
    };

    const { id = '' } = currentRecord;

    if (actionType === 'add') {
      addRole(params)
        .then((res) => {
          console.log('添加角色res', res);
          message.success('添加成功');
          setRoleModalShow(false);
          const pageInfo = {
            page: 1,
            size: 10,
          };
          fetchRoleData(pageInfo);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      updateRole(id, params)
        .then((res) => {
          console.log('定制QAres', res);
          message.success('修改成功');
          setRoleModalShow(false);
          const pageInfo = {
            page: currentPage,
            size: 10,
          };
          fetchRoleData(pageInfo);
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
    fetchRoleData(pageInfo);
  };

  const onQueryFinish = (values: any) => {
    console.log(values);
    const pageInfo = {
      page: 1,
      size: 10,
    };
    fetchRoleData(pageInfo);
  };

  return (
    <div className="role-list-page">
      <h1>角色管理</h1>
      <div className="common-box query-box">
        <Form
          // {...formItemLayout}
          layout="inline"
          ref={formRef}
          form={queryForm}
          name="control-ref"
          onFinish={onQueryFinish}
        >
          <Form.Item name="name" label="角色名称">
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
            handleUpdateRole('add', null);
          }}
        >
          添加角色
        </Button>
      </div>
      <div className="common-box">
        <Table
          columns={columns}
          dataSource={roleData}
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
        title={actionType === 'add' ? '增加角色' : '修改角色'}
        open={roleModalShow}
        onCancel={() => {
          setRoleModalShow(false);
        }}
        onOk={handleAddRoleOk}
      >
        <div style={{ paddingTop: '10px' }}>
          <Form
            form={formInModal}
            name="control-ref"
            // onFinish={onAddQaFinish}
          >
            <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '角色名称不能为空' }]}>
              <Input placeholder='请输入角色名称' />
            </Form.Item>
            <Form.Item name="code" label="角色编码" rules={[{ required: true, message: '角色编码不能为空' }]}>
              <Input placeholder='请输入角色编码，下划线分隔(如ROLE_STAFF)' />
            </Form.Item>
            <Form.Item name="type" label="角色类型">
              <Select
                // mode="multiple"
                placeholder="请选择角色类型"
                defaultValue={[]}
                options={roleTypeData}
              />
            </Form.Item>
            {/* <Form.Item name="answer" label="回答">
              <Input.TextArea />
            </Form.Item> */}
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default RoleList;
