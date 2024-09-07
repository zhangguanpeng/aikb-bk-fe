import { getSplitData, updateSingleSplitTag, uploadSplitImage } from '@/services/aikb/api';
import { EditOutlined, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Space, Table, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { UploadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { history } from '@umijs/max';
import './index.less';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const formInModalItemLayout = { labelCol: { span: 3 }, wrapperCol: { span: 20 } };

const SplitList: React.FC = () => {
  const [formInEditSingleModal] = Form.useForm();
  const [queryForm] = Form.useForm();
  const [splitDetailModalShow, setSplitDetailModalShow] = useState(false);
  const [splitEditSingleModalShow, setSplitEidtSingleModalShow] = useState(false);
  const [splitEditMutipleModalShow, setSplitEidtMutipleModalShow] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [selectedRows4Edit, setSelectedRows4Edit] = useState<any>([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [splitData, setSplitData] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentRecord, setCurrentRecord] = useState({});
  const [selectedFileList, setSelectedFileList] = useState([]);

  let fileList = [];

  const fetchSplitData = (pageInfo: any) => {
    const queryParams = queryForm.getFieldsValue();
    const params = {
      content: '',
      ...pageInfo,
      sort: 'createdDate,desc',
    };

    getSplitData(history?.location?.state.documentId, params).then((res) => {
        console.log('切片列表res', res);
        setSplitData(res.payload);
        setTotal(res.totalElements);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // const handleDeleteSplit = (id: string) => {
  //   deleteCustomQa(id)
  //     .then(() => {
  //       message.success('删除成功');
  //       const pageInfo = {
  //         page: 1,
  //         size: 10,
  //       };
  //       fetchSplitData(pageInfo);
  //     })
  //     .catch(() => {
  //       message.error('删除失败');
  //     });
  // };

  const customRequest = () => {
    console.log('selectedFileList', selectedFileList);
    if (selectedFileList.length < 1) {
      message.warning('请先选择图片再上传');
      return false;
    }
    let formData = new FormData();
    selectedFileList.forEach((file: any) => {
      formData.append(`imageList`, file);
    });

    uploadSplitImage(currentRecord.id, formData)
      .then((res: any) => {
        console.log('上传图片res', res);
        message.success('上传成功');
        setUploadedImages(res.payload);
        // setSelectedFileList([]);
        // const pageInfo = {
        //   page: 1,
        //   size: 10,
        // };
        // fetchSplitData(pageInfo);
      })
      .catch(() => {
        message.error('上传失败');
        // setSelectedFileList([]);
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
              const initFormValues = {
                content: record.content
              };
              formInEditSingleModal.setFieldsValue(initFormValues);
              setCurrentRecord(record);
              setSplitEidtSingleModalShow(true);
            }}
          >
            编辑
          </a>
          {/* <a
            style={{ color: 'red' }}
            onClick={() => {
              handleDeleteSplit(record.id);
            }}
          >
            删除
          </a> */}
        </Space>
      ),
    },
  ];

  const uploadImageProps: UploadProps = {
    name: 'file',
    accept: '.png,.jpg,.jpeg',
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
      uploadSplitImage(currentRecord.id, params)
        .then(() => {
          message.success(`${info.file.name} 上传成功`);
          const pageInfo = {
            page: 1,
            size: 10,
          };
          fetchSplitData(pageInfo);
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

  useEffect(() => {
    const pageInfo = {
      page: 1,
      size: 10,
    };
    fetchSplitData(pageInfo);
  }, []);

  const handleEditSingleSplitOk = () => {
    const { content } = formInEditSingleModal.getFieldsValue();
    const params = {
      oriSplitIdList: [currentRecord.id],
      newSplitList: [
        {
          content: content,
          imageList: uploadedImages
        }
      ]
    };
    updateSingleSplitTag(params).then((res) => {
      console.log('编辑单个切片res', res);
      message.success('编辑成功');
      setSelectedFileList([]);
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
          setSelectedFileList([]);
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
          <Form
            {...formInModalItemLayout}
            form={formInEditSingleModal}
          >
            <Form.Item name="content" label="切片内容" >
              <Input.TextArea rows={10} />
            </Form.Item>
            <Form.Item name="imgs" label="图片" >
              <Upload {...uploadImageProps}>
                <Button icon={<SearchOutlined />}>选择图片</Button>
              </Upload>
              <Button icon={<UploadOutlined />} style={{marginTop: '10px'}} type='primary' onClick={customRequest}>点击上传</Button>
            </Form.Item>
          </Form>
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
