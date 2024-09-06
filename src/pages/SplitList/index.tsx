import { deleteCustomQa, getCustomQaData, getSplitData, updateSingleSplitTag } from '@/services/aikb/api';
import { EditOutlined, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Space, Table } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { history, Link } from '@umijs/max';
import './index.less';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const SplitList: React.FC = () => {
  const formRef = React.useRef<FormInstance>(null);
  const [formInModal] = Form.useForm();
  const [queryForm] = Form.useForm();
  const [qaModalShow, setQaModalShow] = useState(false);
  const [splitDetailModalShow, setSplitDetailModalShow] = useState(false);
  const [splitEditSingleModalShow, setSplitEidtSingleModalShow] = useState(false);
  const [splitEditMutipleModalShow, setSplitEidtMutipleModalShow] = useState(false);
  const [singleSplitContent, setSingleSplitContent] = useState('');
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [selectedRows4Edit, setSelectedRows4Edit] = useState<any>([]);
  const [actionType, setActionType] = useState('add');
  const [currentPage, setCurrentPage] = useState(1);
  const [qaData, setQaData] = useState([]);
  const [splitData, setSplitData] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentRecord, setCurrentRecord] = useState({});

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

  const fetchSplitData = (pageInfo: any) => {
    const queryParams = queryForm.getFieldsValue();
    const params = {
      content: '',
      ...pageInfo,
      sort: 'createdDate,desc',
    };

    getSplitData(history?.location?.state.documentId, params).then((res) => {
        console.log('切片res', res);
        setSplitData(res.payload);
        setTotal(res.totalElements);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDeleteQa = (id: string) => {
    deleteCustomQa(id)
      .then(() => {
        message.success('删除成功');
        const pageInfo = {
          page: 1,
          size: 10,
        };
        fetchQaData(pageInfo);
      })
      .catch(() => {
        message.error('删除失败');
      });
  };

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record: DataType) => ({
      disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record.name,
    }),
  };

  const columns: ColumnsType<DataType> = [
    {
      title: '分片内容',
      dataIndex: 'content',
      key: 'content',
      // width: 200,
      render: (text) => <span>{text.length > 100 ? `${text.substr(0, 100)}...` : text}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record: any) => (
        <Space size="middle">
          <a
            onClick={() => {
              // handleUpdateQa('edit', record);
              setCurrentRecord(record);
              setSplitDetailModalShow(true);
            }}
          >
            详情
          </a>
          <a
            onClick={() => {
              setCurrentRecord(record);
              setSingleSplitContent(record.content);
              setSplitEidtSingleModalShow(true);
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
    fetchSplitData(pageInfo);
  }, []);

  const handleEditSingleSplitOk = () => {
    const params = {
      oriSplitIdList: [currentRecord.id],
      newSplitList: [
        {
          content: singleSplitContent,
          imageList: [
            {
              oriImageFileUrl: '',
              thumbnailFileUrl: ''
            }
          ]
        }
      ]
    };
    updateSingleSplitTag(params).then((res) => {
      console.log('编辑单个切片res', res);
      message.success('编辑成功');
      setSplitEidtSingleModalShow(false);
      const pageInfo = {
        page: 1,
        size: 10,
      };
      fetchSplitData(pageInfo);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  const handleAddSplit = (index: number) => {
    const newSplit = {
      id: index + 1,
      content: '',
    };
    selectedRows4Edit.splice(index + 1, 0, newSplit);
    setSelectedRows4Edit([...selectedRows4Edit]);
  }

  const handleRemoveSplit = (index: number) => {
    selectedRows4Edit.splice(index, 1);
    setSelectedRows4Edit([...selectedRows4Edit]);
  }

  const handleSplitContentChange = (value: string, index: number) => {
    selectedRows4Edit[index].content = value;
    setSelectedRows4Edit([...selectedRows4Edit]);
  }

  const handleBatchEditSplit = () => {
    const rowIds = selectedRows.map((item: any) => item.id);
    const newSplitList = selectedRows4Edit.map((item: any) => {
      const splitItem = {
        content: item.content,
        imageList: [
          {
            oriImageFileUrl: '',
            thumbnailFileUrl: ''
          }
        ]
      };

      return splitItem;
    });
    const params = {
      oriSplitIdList: rowIds,
      newSplitList
    };
    updateSingleSplitTag(params).then((res) => {
      console.log('编辑多个切片res', res);
      message.success('编辑成功');
      setSplitEidtSingleModalShow(false);
      const pageInfo = {
        page: 1,
        size: 10,
      };
      setSplitEidtMutipleModalShow(false);
      fetchSplitData(pageInfo);
    })
    .catch((error) => {
      console.log(error);
    });
    
  }

  const handlePageChange = (page: number, pageSize: number) => {
    console.log(page);
    setCurrentPage(page);
    const pageInfo = {
      page,
      size: pageSize,
    };
    fetchSplitData(pageInfo);
  };

  return (
    <div className="customqa-page">
      <h1>分片详情</h1>
      <div className="btn-box">
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            // handleUpdateQa('add', null);
            setSelectedRows4Edit(JSON.parse(JSON.stringify(selectedRows)));
            setSplitEidtMutipleModalShow(true);
          }}
        >
          批量编辑分片
        </Button>
      </div>
      <div className="common-box">
        <Table
          rowSelection={{
            type: 'checkbox',
            ...rowSelection,
          }}
          columns={columns}
          dataSource={splitData}
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
        title='切片详情'
        open={splitDetailModalShow}
        onOk={() => {
          setSplitDetailModalShow(false);
        }}
        width={800}
        closeIcon={false}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <OkBtn />
          </>
        )}
      >
        <div style={{ paddingTop: '10px' }}>
          {currentRecord?.content}
        </div>
      </Modal>
      <Modal
        title="编辑切片"
        open={splitEditSingleModalShow}
        onCancel={() => {
          setSplitEidtSingleModalShow(false);
        }}
        onOk={handleEditSingleSplitOk}
        width={800}
        closeIcon={false}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        )}
      >
        <div style={{ paddingTop: '10px' }}>
          <div>
            <Input.TextArea rows={10} value={singleSplitContent} onChange={(e) => { setSingleSplitContent(e.target.value); }} />
          </div>
        </div>
      </Modal>
      <Modal
        title='批量编辑分片'
        open={splitEditMutipleModalShow}
        width={800}
        onCancel={() => {
          setSelectedRows4Edit(JSON.parse(JSON.stringify(selectedRows)));
          setSplitEidtMutipleModalShow(false);
        }}
        onOk={handleBatchEditSplit}
        className='split-edit-mutiple-modal'
      >
        <div className='modal-content'>
          {
            selectedRows4Edit.map((rowItem: any, index: number) => (
              <div key={rowItem.id} className='split-item'>
                <Input.TextArea rows={8} value={rowItem.content} onChange={e => { handleSplitContentChange(e.target.value, index) }} />
                <div className='split-action-btns'>
                  <Button type="link" size='small' icon={<PlusCircleOutlined />} onClick={() => { handleAddSplit(index) }}>添加分片</Button>
                  <Button type="link" size='small' icon={<MinusCircleOutlined />} onClick={() => { handleRemoveSplit(index) }} danger>删除分片</Button>
                </div>
              </div>
            ))
          }
        </div>
      </Modal>
    </div>
  );
};

export default SplitList;
