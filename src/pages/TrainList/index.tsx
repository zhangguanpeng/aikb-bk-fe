import {
  addTrain,
  deleteTrain,
  editTrain,
  getTrainData,
  startTrain,
  stopTrain,
  uploadTrainDocument,
} from '@/services/aikb/api';
import { PlusOutlined, UnorderedListOutlined, RedoOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Form, Input, InputNumber, message, Modal, Table, Upload } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { useForm } from 'antd/es/form/Form';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
// import dayjs from 'dayjs';
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
}

// const formItemLayout = { labelCol: { span: 4 }, wrapperCol: { span: 14 } };

const TrainList: React.FC = () => {
  const formRef = React.useRef<FormInstance>(null);
  const [form] = useForm();
  const [formInModal] = Form.useForm();
  const [trainModalShow, setTrainModalShow] = useState(false);
  const [trainDetailModalShow, setTrainDetailModalShow] = useState(false);
  const [trainUpDocModalShow, setTrainUpDocModalShow] = useState(false);
  const [actionType, setActionType] = useState('add');
  // const [currentRecord, setCurrentRecord] = useState({});
  const [trainData, setTrainData] = useState([]);
  const [documentData, setDocumentData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedFileList, setSelectedFileList] = useState([]);
  const [currentRecord, setCurrentRecord] = useState({});

  let fileList: any = [];

  const fetchTrainData = (pageInfo: any, formValues: any) => {
    const { trainName = '' } = formValues || form.getFieldsValue();
    console.log('formValues', formValues);
    const params = {
      id: '',
      name: trainName,
      page: pageInfo.page,
      size: pageInfo.size,
      sort: 'createdDate,desc',
      // createTime: createTime ? dayjs(createTime).unix() : '',
      // sort: 'createdDate,desc'
    };
    getTrainData(params)
      .then((res) => {
        console.log('训练列表res', res);
        setTrainData(res.payload);
        setTotal(res.totalElements);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const customRequest = () => {
    console.log('fileList', fileList);
    if (selectedFileList.length < 1) {
      message.warning('请先选择文档');
      return false;
    }
    let formData = new FormData();
    selectedFileList.forEach((file: any) => {
      formData.append(`fileList`, file);
    });

    // @ts-ignore
    return uploadTrainDocument(formData, currentRecord.id)
      .then((res: any) => {
        message.success('上传成功');
        console.log('上传文档res', res);
        fileList = [];
        setSelectedFileList([]);
        // @ts-ignore
        // setDocumentData([...documentData, ...res.payload]);
        setTrainUpDocModalShow(false);
        setDocumentData([]);
        const pageInfo = {
          page: 1,
          size: 10,
        };
        formInModal.resetFields();
        fetchTrainData(pageInfo, null);
      })
      .catch((error) => {
        message.error(`上传失败：${error.response.data.message}`);
        fileList = [];
        setSelectedFileList([]);
      });
  };

  useEffect(() => {
    const pageInfo = {
      page: 1,
      size: 10,
    };
    fetchTrainData(pageInfo, {});
  }, []);

  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.doc,.docx,.pdf,.xlsx',
    // action: '/aikb/v1/doc/upload',
    beforeUpload: (file) => {
      // @ts-ignore
      fileList = [...fileList, file];
      setSelectedFileList(fileList);

      return false;
    },
    maxCount: 50,
    showUploadList: true,
    multiple: true,
    fileList: selectedFileList,
  };

  // const uploadProps: UploadProps = {
  // 	onRemove: (file) => {
  // 		// @ts-ignore
  // 		const index = fileList.indexOf(file);
  // 		const newFileList = fileList.slice();
  // 		newFileList.splice(index, 1);
  // 		setFileList(newFileList);
  // 	},
  // 	beforeUpload: (file) => {
  // 		// @ts-ignore
  // 		setFileList([...fileList, file]);

  // 		return false;
  // 	},
  // 	fileList,
  // 	maxCount: 50,
  // 	showUploadList: true,
  // 	multiple: true,
  // };

  const handlePageChange = (page: number, pageSize: number) => {
    console.log(page);
    setCurrentPage(page);
    const pageInfo = {
      page,
      size: pageSize,
    };
    fetchTrainData(pageInfo, null);
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

  const handleDownloadTrain = (id: string) => {
    downloadFile(`/aikb/v1/train/${id}/model/download`);
  };

  // const handleEditTrain = (record: any) => {
  // 	setCurrentRecord(record);
  // 	setActionType('edit');
  // 	setTrainModalShow(true);
  // }

  // const handleDeleteFile = (id: string) => {
  // 	deleteDocument(id).then(() => {
  // 		message.success('文件删除成功');
  // 		const pageInfo = {
  // 			page: 1,
  // 			size: 10,
  // 		};
  // 		fetchTrainData(pageInfo, null);
  // 	}).catch(() => {
  // 		message.error('文件删除失败');
  // 	});
  // };

  const handleStartTrain = (id: string) => {
    startTrain(id)
      .then(() => {
        message.success('开启成功');
        const pageInfo = {
          page: 1,
          size: 10,
        };
        fetchTrainData(pageInfo, null);
      })
      .catch((error) => {
        console.log(error);
        message.error(`开启失败：${error.response.data.message}`);
      });
  };

  const handleStopTrain = (id: string) => {
    stopTrain(id)
      .then(() => {
        message.success('停止成功');
        const pageInfo = {
          page: 1,
          size: 10,
        };
        fetchTrainData(pageInfo, null);
      })
      .catch((error) => {
        message.error(`停止失败：${error.response.data.message}`);
      });
  };

  const handleDeleteTrain = (id: string) => {
    deleteTrain(id)
      .then(() => {
        message.success('删除成功');
        const pageInfo = {
          page: 1,
          size: 10,
        };
        fetchTrainData(pageInfo, null);
      })
      .catch((error) => {
        message.error(`删除失败：${error.response.data.message}`);
      });
  };

  // const handleDeleteDocument = (fileId: string) => {
  //   console.log('删除fileId', fileId);
  //   console.log('documentData', documentData);
  //   for (let i = 0; i < documentData.length; i++) {
  //     // @ts-ignore
  //     if (documentData[i].fileId === fileId) {
  //       documentData.splice(i, 1);
  //     }
  //   }
  //   setDocumentData([...documentData]);
  // };

  const handleUpdateTrain = (action: string, record: any) => {
    if (action === 'edit') {
      setCurrentRecord(record);
      // const documentData = (record.fileNameList || []).map((item: string) => {
      //   const docItem = {
      //     name: item
      //   };
      //   return docItem;
      // });
      // setDocumentData(documentData);
      const { trainParameter = {} } = record;
      const initFormValues = {
        trainName: record.name,
        epochNumber: trainParameter.epochNumber,
        endpoint: trainParameter.endpoint || '',
      };
      formInModal.setFieldsValue(initFormValues);
    }
    if (action === 'add') {
      setDocumentData([]);
    }
    setActionType(action);
    setTrainModalShow(true);
  };

  const handleShowTrainDetail = (record: any) => {
    setCurrentRecord(record);
    setTrainDetailModalShow(true);
    const documentData = (record.fileNameList || []).map((item: string) => {
      const docItem = {
        name: item
      };
      return docItem;
    });
    setDocumentData(documentData);
    const { trainParameter = {} } = record;
    const initFormValues = {
      trainName: record.name,
      epochNumber: trainParameter.epochNumber,
      endpoint: trainParameter.endpoint || '',
    };
    formInModal.setFieldsValue(initFormValues);
  }

  const columns: ColumnsType<DataType> = [
    {
      title: '训练名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      // render: (text) => <a>{text}</a>,
    },
    {
      title: '状态',
      dataIndex: 'category',
      key: 'category',
      width: 90,
      render: (_, record: any) => <span>{record.status || '--'}</span>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      width: 90,
      render: (_, record: any) => <span>{record.message || '--'}</span>,
    },
    {
      title: '训练进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 90,
      render: (_, record: any) => <span>{`${(record.progress || '0')}%`}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 350,
      render: (_, record: any) => (
        <>
          <span>
            {record.status !== 'RUNNING' ? (
              <Button
                type='link'
                onClick={() => {
                  handleStartTrain(record.id);
                }}
                style={{ padding: '4px 5px' }}
              >
                开启训练
              </Button>
            ) : (
              <Button
                type='link'
                onClick={() => {
                  handleStopTrain(record.id);
                }}
                style={{ padding: '4px 5px' }}
              >
                停止训练
              </Button>
            )}
          </span>
          <Button
              type='link'
              onClick={() => {
                handleShowTrainDetail(record);
              }}
              style={{ padding: '4px 5px' }}
            >
              详情
            </Button>
          <Button
              type='link'
              onClick={() => {
                handleUpdateTrain('edit', record);
              }}
              style={{ padding: '4px 5px' }}
              disabled={record.status === 'RUNNING'}
            >
              编辑
            </Button>
            <Button
              type='link'
              onClick={() => {
                setCurrentRecord(record);
                setTrainUpDocModalShow(true);
              }}
              style={{ padding: '4px 5px' }}
              disabled={record.status === 'RUNNING'}
            >
              上传文档
            </Button>
            <Button
              type='link'
              onClick={() => {
                handleDownloadTrain(record.id);
              }}
              style={{ padding: '4px 5px' }}
              disabled={record.status === 'RUNNING'}
            >
              下载
            </Button>
            <Button
              type='link'
              onClick={() => {
                handleDeleteTrain(record.id);
              }}
              style={{ color: 'red', padding: '4px 5px' }}
              disabled={record.status === 'RUNNING' || record.status === 'FAILED'}
            >
              删除
            </Button>
        </>
      ),
    },
  ];

  const modalColumns: ColumnsType<DataType> = [
    {
      title: '文件名称',
      dataIndex: 'name',
      key: 'name',
      // width: 300,
      // render: (text) => <a>{text}</a>,
    },
    // {
    // 	title: '创建时间',
    // 	dataIndex: 'createdTime',
    // 	key: 'createdTime',
    // 	width: 180,
    // },
    // {
    // 	title: '上传状态',
    // 	dataIndex: 'category',
    // 	key: 'category',
    // 	width: 150,
    // 	render: (_, record: any) => (
    // 		<span>{record.status || '默认类目'}</span>
    // 	),
    // },
    // {
    //   title: '操作',
    //   key: 'action',
    //   width: 100,
    //   render: (_, record: any) => (
    //     <>
    //       <Space size="middle">
    //         <a
    //           onClick={() => {
    //             handleDeleteDocument(record.fileId);
    //           }}
    //           style={{ color: 'red', paddingLeft: '10px' }}
    //         >
    //           删除
    //         </a>
    //       </Space>
    //     </>
    //   ),
    // },
  ];

  const onFinish = (formValues: any) => {
    const pageInfo = {
      page: 1,
      size: 10,
    };
    fetchTrainData(pageInfo, formValues);
  };

  const handleAddTrainOk = () => {
    console.log('formInModal value', formInModal.getFieldsValue());
    const { trainName, epochNumber, endpoint } = formInModal.getFieldsValue();
    if (!trainName || !epochNumber) {
      message.warning('有必填项未输入！');
      return;
    }
    const params = {
      name: trainName,
      // files: documentData,
      trainParameter: {
        epochNumber,
        endpoint
      },
    };

    // const { id = '' } = currentRecord;

    if (actionType === 'add') {
      addTrain(params)
        .then((res: any) => {
          console.log('新建训练res', res);
          message.success('新建训练成功');
          setTrainModalShow(false);
          // setDocumentData([]);
          const pageInfo = {
            page: 1,
            size: 10,
          };
          formInModal.resetFields();
          fetchTrainData(pageInfo, null);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      // @ts-ignore
      editTrain(currentRecord.id, params)
        .then(() => {
          message.success('修改训练成功');
          setTrainModalShow(false);
          // setDocumentData([]);
          const pageInfo = {
            page: 1,
            size: 10,
          };
          formInModal.resetFields();
          fetchTrainData(pageInfo, null);
        })
        .catch((error) => {
          console.log(error);
        });
    }

    fileList = [];
    setSelectedFileList([]);
  };

  const handleAddTrainCancel = () => {
    setTrainModalShow(false);
    formInModal.resetFields();
    setDocumentData([]);
    fileList = [];
    setSelectedFileList([]);
  };

  const handleUploadDocCancel = () => {
    setTrainUpDocModalShow(false);
    formInModal.resetFields();
    setDocumentData([]);
    fileList = [];
    setSelectedFileList([]);
  };

  const handleRefresh = () => {
    const pageInfo = {
      page: 1,
      size: 10,
    };
    fetchTrainData(pageInfo, null);
  }

  // const handleUploadDocOk = () => {
  //   customRequest().then(() => {

  //   });
  //   setTrainUpDocModalShow(false);
  //   setDocumentData([]);
  //   const pageInfo = {
  //     page: 1,
  //     size: 10,
  //   };
  //   formInModal.resetFields();
  //   fetchTrainData(pageInfo, null);
  // }

  // const startUpload = () => {
  // 	console.log('fileList', fileList);
  // 	const params = {
  // 		fileList,
  // 	};
  // 	uploadTrainDocument(params).then(() => {
  // 		//
  // 	}).catch(error => {
  // 		console.log('上传文件失败', error);
  // 	});
  // }

  return (
    <div className="category-page">
      <h1>训练管理</h1>
      <div className="common-box query-box">
        <Form
          // {...formItemLayout}
          layout="inline"
          ref={formRef}
          form={form}
          name="control-ref"
          onFinish={onFinish}
        >
          <Form.Item name="trainName" label="训练名称">
            <Input style={{ width: 200 }} />
          </Form.Item>
          {/* <Form.Item name="createTime" label="创建时间">
						<DatePicker />
					</Form.Item> */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className="btn-box">
        {/* <Upload {...props}>
					<Button type="link" icon={<UploadOutlined />}>
						上传文档
					</Button>
				</Upload> */}
        <Button
          type="link"
          icon={<PlusOutlined />}
          onClick={() => {
            handleUpdateTrain('add', null);
          }}
        >
          新建训练
        </Button>
        <Button
          type='link'
          icon={<RedoOutlined />}
          onClick={handleRefresh}
        >
          刷新
        </Button>
      </div>
      <div className="common-box">
        <Table
          bordered
          columns={columns}
          dataSource={trainData}
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
        title={actionType === 'add' ? '新建训练' : '编辑训练'}
        open={trainModalShow}
        onCancel={handleAddTrainCancel}
        onOk={handleAddTrainOk}
        width={660}
        className="create-train-modal"
      >
        <div style={{ paddingTop: '10px' }}>
          <Form
            form={formInModal}
            name="control-ref"
            // onFinish={onAddQaFinish}
          >
            <Form.Item name="trainName" label="训练名称" rules={[{ required: true, message: '请输入训练名称' }]}>
              <Input placeholder="请输入训练名称" />
            </Form.Item>
            <Form.Item name="endpoint" label="训练服务地址">
              <Input placeholder="请输入训练服务地址，如：http://xxx.com" />
            </Form.Item>
            {/* <div className="upload-area">
              <Upload {...uploadProps}>
                <Button type="link" icon={<UnorderedListOutlined />}>
                  选择文档
                </Button>
              </Upload>
              <div className="upload-box">
                <Button
                  type="link"
                  onClick={customRequest}
                  icon={<UploadOutlined />}
                  className="upload-btn"
                >
                  上传文档
                </Button>
                <span className="tips">请先选择文档，然后上传</span>
              </div>
            </div>
            <div className="table-area">
              <Table
                bordered
                columns={modalColumns}
                dataSource={documentData}
                rowKey={(record: any) => record.fileId}
                pagination={{
                	showTotal: () => { return `共有${total}条数据`; },
                	showSizeChanger: true,
                	onChange: handlePageChange,
                	onShowSizeChange: handlePageChange,
                	current: currentPage,
                	total
                }}
                scroll={{
                  x: true,
                }}
              />
            </div> */}
            <Form.Item name="epochNumber" label="训练轮数" rules={[{ required: true, message: '请输入训练轮数' }]}>
              <InputNumber placeholder="请输入训练轮数" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <Modal
        title="训练详情"
        open={trainDetailModalShow}
        onCancel={() => {
          setTrainDetailModalShow(false);
          formInModal.resetFields();
          setDocumentData([]);
        }}
        onOk={() => {
          setTrainDetailModalShow(false);
          formInModal.resetFields();
          setDocumentData([]);
        }}
        width={660}
        className="create-train-modal"
      >
        <div style={{ paddingTop: '10px' }}>
          <Form
            form={formInModal}
            name="control-ref"
            // onFinish={onAddQaFinish}
          >
            <Form.Item name="trainName" label="训练名称">
              <Input placeholder="请输入训练名称" disabled />
            </Form.Item>
            <Form.Item name="endpoint" label="训练服务地址">
              <Input placeholder="请输入训练服务地址，如：http://xxx.com" disabled />
            </Form.Item>
            <div className="table-area">
              <Table
                bordered
                columns={modalColumns}
                dataSource={documentData}
                rowKey={(record: any) => record.fileId}
                // pagination={{
                // 	showTotal: () => { return `共有${total}条数据`; },
                // 	showSizeChanger: true,
                // 	onChange: handlePageChange,
                // 	onShowSizeChange: handlePageChange,
                // 	current: currentPage,
                // 	total
                // }}
                scroll={{
                  x: true,
                }}
              />
            </div>
            <Form.Item name="epochNumber" label="训练轮数">
              <InputNumber placeholder="请输入训练轮数" disabled />
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <Modal
        title="上传文档"
        open={trainUpDocModalShow}
        onCancel={handleUploadDocCancel}
        onOk={customRequest}
        width={660}
        className="create-train-modal"
      >
        <div style={{ paddingTop: '10px' }}>
            <div className="upload-area">
              <Upload {...uploadProps}>
                <Button type="link" icon={<UnorderedListOutlined />}>
                  选择文档
                </Button>
              </Upload>
              <div className="upload-box">
                {/* <Button
                  type="link"
                  onClick={customRequest}
                  icon={<UploadOutlined />}
                  className="upload-btn"
                >
                  上传文档
                </Button> */}
                <span className="tips">请先选择文档，然后点击确定后开始上传</span>
              </div>
            </div>
            {/* <div className="table-area">
              <Table
                bordered
                columns={modalColumns}
                dataSource={documentData}
                rowKey={(record: any) => record.fileId}
                // pagination={{
                // 	showTotal: () => { return `共有${total}条数据`; },
                // 	showSizeChanger: true,
                // 	onChange: handlePageChange,
                // 	onShowSizeChange: handlePageChange,
                // 	current: currentPage,
                // 	total
                // }}
                scroll={{
                  x: true,
                }}
              />
            </div> */}
        </div>
      </Modal>
    </div>
  );
};

export default TrainList;
