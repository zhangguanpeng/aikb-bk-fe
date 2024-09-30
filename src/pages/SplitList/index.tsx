import { getSplitData, updateSingleSplitTag, uploadSplitImage } from '@/services/aikb/api';
import { EditOutlined, PlusCircleOutlined, MinusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Space, Table } from 'antd';
import type { UploadProps } from 'antd';
// import { UploadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
// import {
// 	getCommands,
// 	getExtraCommands,
// } from "@uiw/react-md-editor/commands-cn";
import { history } from '@umijs/max';
import 'katex/dist/katex.min.css';
import './index.less';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const formInModalItemLayout = { labelCol: { span: 3 }, wrapperCol: { span: 20 } };
// let fileList: any = [];

const SplitList: React.FC = () => {
  const [formInEditSingleModal] = Form.useForm();
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
  const [splitContent, setSplitContent] = useState('');

  const fetchSplitData = (pageInfo: any) => {
    const params = {
      content: '',
      ...pageInfo,
      sort: 'splitNumber,ASC',
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

  const onUploadImg = async (files: any, callback: any) => {
    // const res = await Promise.all(
    //   files.map((file: any) => {
    //     return new Promise((rev, rej) => {
    //       const form = new FormData();
    //       form.append('file', file);
    //       axios.post('/api/img/upload', form, {
    //           headers: {
    //             'Content-Type': 'multipart/form-data'
    //           }
    //         })
    //         .then((res: any) => rev(res))
    //         .catch((error: any) => rej(error));
    //     });
    //   })
    // )
    let formData = new FormData();
    files.forEach((file: any) => {
      formData.append(`imageList`, file);
    });
    // formData.append(`imageList`, file);
    uploadSplitImage(currentRecord.id, formData)
      .then((res: any) => {
        console.log('上传图片res', res);
        message.success('上传成功');
        setUploadedImages(res.payload);
        let newSplitContent = splitContent;
        res.payload.forEach((imgItem: any) => {
          newSplitContent += `![](aikb/v1/split/image/${imgItem.thumbnailFileUrl})`
        });
        setSplitContent(newSplitContent);
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
      render: (text) => <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{text.length > 100 ? `${text.substr(0, 100)}...` : text}</ReactMarkdown>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: any) => (
        <Space size="middle">
          <a
            onClick={() => {
              // handleUpdateQa('edit', record);
              console.log('record', record);
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
              setSplitContent(record.content);
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
    beforeUpload: (file, fileList) => {
      console.log('fileList1', fileList);
      console.log('beforeUpload file', file);
      // @ts-ignore
      // fileList = [...fileList, file];
      // @ts-ignore
      setSelectedFileList(fileList);
      // console.log('fileList2', fileList);
      return false;
    },
    onChange: ({ fileList }) => {
      console.log('onchange fileList', fileList);
      // @ts-ignore
      // setSelectedFileList(fileList);
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
    onRemove: (file) => {
      console.log('remove file', file);
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
            if (selectedRows.length < 1) {
              message.warning('请先选择表格分片');
              return false;
            }
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
            showQuickJumper: true,
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
        className='split-detail-modal'
      >
        <div style={{ paddingTop: '10px' }}>
          <div className='text-content'>
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {currentRecord?.content}
            </ReactMarkdown>
          </div>
          {/* <div className='image-content'>
            {
              currentRecord.imageList?.map((imageItem: any) => {
                return imageItem.thumbnailFileUrl ? <img src={`aikb/v1/split/image/${imageItem.thumbnailFileUrl}`} style={{marginRight: '5px'}} /> : null
              })
            }
          </div> */}
        </div>
      </Modal>
      <Modal
        title="编辑切片"
        open={splitEditSingleModalShow}
        onCancel={() => {
          // fileList = [];
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
              {/* <Input.TextArea rows={10} /> */}
              {/* <MDEditor
                commands={[commands.image]}
                enableScroll={false}
                extraCommands={[...getExtraCommands()]}
                height="40vh"
                onChange={(val) => {
                  if (val) setSplitContent(val);
                }}
                preview="edit"
                value={splitContent}
              /> */}
              <MdEditor modelValue={splitContent} toolbars={['image']} noImgZoomIn onUploadImg={onUploadImg} />
            </Form.Item>
            {/* {
              currentRecord.imageList && currentRecord.imageList.length > 0 && (
                <Form.Item name="uploadedImages" label="已有图片" >
                  {
                    currentRecord.imageList?.map((imageItem: any) => {
                      return imageItem.thumbnailFileUrl ? (
                        <Image
                          width={100}
                          src={`aikb/v1/split/${currentRecord.id}/image/${imageItem.thumbnailFileUrl}`}
                          style={{marginRight: '5px'}}
                        />
                      ) : '无'
                    })
                  }
                </Form.Item>
              )
            } */}
            {/* <Form.Item name="imgs" label="上传图片" >
              <Upload {...uploadImageProps}>
                <Button icon={<SearchOutlined />}>选择图片</Button>
              </Upload>
              <Button icon={<UploadOutlined />} style={{marginTop: '10px'}} type='primary' onClick={customRequest}>点击上传</Button>
            </Form.Item> */}
          </Form>
        </div>
      </Modal>
      <Modal
        title='批量编辑分片'
        open={splitEditMutipleModalShow}
        width={880}
        onCancel={() => {
          setSelectedRows4Edit(JSON.parse(JSON.stringify(selectedRows)));
          setSplitEidtMutipleModalShow(false);
        }}
        onOk={handleBatchEditSplit}
        className='split-edit-mutiple-modal'
      >
        <div className='note'>
          <ExclamationCircleOutlined />
          <span className='text'>左侧为原切片内容，右侧可进行切片自由编辑（拆分与合并）</span>
          </div>
        <div className='modal-content'>
          <div className='left'>
            {
              selectedRows.map((rowItem: any) => (
                <div key={rowItem.id} className='split-item-content'>
                  {rowItem.content}
                </div>
              ))
            }
          </div>
          <div className='right'>
            {
              selectedRows4Edit.map((rowItem: any, index: number) => (
                <div key={rowItem.id} className='split-item-edit'>
                  <Input.TextArea rows={8} value={rowItem.content} onChange={e => { handleSplitContentChange(e.target.value, index) }} />
                  <div className='split-action-btns'>
                    <Button type="link" size='small' icon={<PlusCircleOutlined />} onClick={() => { handleAddSplit(index) }}>添加分片</Button>
                    <Button type="link" size='small' icon={<MinusCircleOutlined />} onClick={() => { handleRemoveSplit(index) }} danger>删除分片</Button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SplitList;
