import { Form, Button, Input, message, Space, Table, Upload, Modal, InputNumber, DatePicker } from 'antd';
import {
	getTrainData, addTrain, deleteTrain, startTrain, stopTrain, uploadTrainDocument,
} from '@/services/aikb/api';
import type { UploadProps } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useForm } from 'antd/es/form/Form';
import React, { useState, useEffect } from 'react';
import type { FormInstance } from 'antd/es/form';
import dayjs from 'dayjs';
import './index.less';

interface DataType {
	key: string;
	id: string,
	name: string,
	splitStatus: string, // 分片状态，FRESH：未处理，SPLITTING：分片中，SPLIT_COMPLETED：分片完成
	splitCount: string, // 分片数
	tokenNumber: string, // token数
	splitAlgorithm: string, // 分片算法
	fileId: string,
	fileSize: string,
	docHtmlUrl: string, // 文档html地址，用于超链接打开
	createdAt: string, // 创建时间 
	updatedAt: string, // 更新时间
}

// const formItemLayout = { labelCol: { span: 4 }, wrapperCol: { span: 14 } };

const TrainList: React.FC = () => {
	const formRef = React.useRef<FormInstance>(null);
	const [form] = useForm();
	const [formInModal] = Form.useForm();
	const [trainModalShow, setTrainModalShow] = useState(false);
	const [actionType, setActionType] = useState('add');
	// const [currentRecord, setCurrentRecord] = useState({});
	const [trainData, setTrainData] = useState([]);
	const [documentData, setDocumentData] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [total, setTotal] = useState(0);
	// const [fileList, setFileList] = useState([]);
	const [currentRecord, setCurrentRecord] = useState({});

	const fetchTrainData = (pageInfo: any, formValues: any) => {
		const {trainName = '', createTime = ''} = formValues || form.getFieldsValue();
		console.log('formValues', formValues);
		const params = {
			id: '',
			name: trainName,
			page: pageInfo.page,
			size: pageInfo.size,
			createTime: createTime ? dayjs(createTime).unix() : '',
			// sort: 'createdDate,desc'
		};
		getTrainData(params).then(res => {
			console.log('训练列表res', res);
			setTrainData(res.payload);
			setTotal(res.totalElements);
		}).catch((error) => {
			console.log(error);
		});
	}

	useEffect(() => {
		const pageInfo = {
			page: 1,
			size: 10
		};
		fetchTrainData(pageInfo, {});
	}, []);

	const uploadProps: UploadProps = {
		name: 'file',
		// action: '/aikb/v1/doc/upload',
		customRequest(info: any) {
			console.log('upload info', info);

			const params = {
				fileList: info.file,
			};
			uploadTrainDocument(params).then(() => {
				message.success(`${info.file.name} 上传成功`);
				// const pageInfo = {
				// 	page: 1,
				// 	size: 10,
				// };
				// fetchDocumentData(pageInfo, null);
				const documentItem = {
					name: 11,
					createdTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
					status: 'success'
				};
				// @ts-ignore
				setDocumentData([...documentData, documentItem]);
			}).catch(() => {
				message.error(`${info.file.name} 上传失败.`);
				const documentItem = {
					name: info.file.name,
					createdTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
					status: 'fail'
				};
				// @ts-ignore
				setDocumentData([...documentData, documentItem]);
			});
		},
		maxCount: 50,
		showUploadList: false,
		multiple: true,
	};

	// const uploadProps: UploadProps = {
	// 	onRemove: (file) => {
	// 		// @ts-ignore
	// 		const index = fileList.indexOf(file);
	// 		const newFileList = fileList.slice();
	// 		newFileList.splice(index, 1);
	// 		setFileList(newFileList);
	// 	  },
	// 	  beforeUpload: (file) => {
	// 		// @ts-ignore
	// 		setFileList([...fileList, file]);
	  
	// 		return false;
	// 	  },
	// 	  fileList,
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
	}

	const handleDownloadTrain = (id: string) => {
		downloadFile(`/aikb/v1/train/model/download/${id}`);
	}

	const handleEditTrain = (record: any) => {
		setCurrentRecord(record);
		setActionType('edit');
		setTrainModalShow(true);
	}

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
		startTrain(id).then(() => {
			message.success('开启成功');
			const pageInfo = {
				page: 1,
				size: 10,
			};
			fetchTrainData(pageInfo, null);
		}).catch(() => {
			message.error('开启失败');
		});
	};

	const handleStopTrain = (id: string) => {
		stopTrain(id).then(() => {
			message.success('停止成功');
			const pageInfo = {
				page: 1,
				size: 10,
			};
			fetchTrainData(pageInfo, null);
		}).catch(() => {
			message.error('停止失败');
		});
	};

	const handleDeleteTrain = (id: string) => {
		deleteTrain(id).then(() => {
			message.success('删除成功');
			const pageInfo = {
				page: 1,
				size: 10,
			};
			fetchTrainData(pageInfo, null);
		}).catch(() => {
			message.error('删除失败');
		});
	};

	const handleDeleteDocument = (id: number) => {
		for (let i = 0; i < documentData.length; i++) {
			// @ts-ignore
			if (documentData[i].id === id) {
				documentData.splice(i, 1);
			}
		}
		setDocumentData([...documentData]);
	}

	const handleUpdateTrain = (action: string, record: any) => {
		const { parameter = {} } = record;
		const initFormValues = {
			trainName: action === 'add' ? '' : record.name,
			epochNumber: action === 'add' ? '' : parameter.epochNumber
		};
		formInModal.setFieldsValue(initFormValues);
		setActionType(action);
		setTrainModalShow(true);
		// if (action === 'edit') {
		// 	setCurrentRecord(record);
		// }
	}

	const columns: ColumnsType<DataType> = [
		{
			title: '训练名称',
			dataIndex: 'name',
			key: 'name',
			width: 350,
			// render: (text) => <a>{text}</a>,
		},
		{
			title: '执行状态',
			dataIndex: 'category',
			key: 'category',
			width: 90,
			render: (_, record: any) => (
				<span>{record.status || '默认'}</span>
			),
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
			width: 250,
			render: (_, record: any) => (
				<>
					<Space size="middle">
						{
							record.status === 'READY' ? (
								<a onClick={() => { handleStartTrain(record.id) }}>开启训练</a>
							) : (
								<a onClick={() => { handleStopTrain(record.id) }}>停止训练</a>
							)
						}
					</Space>
					<Space size="middle">
						<a onClick={() => { handleUpdateTrain('edit', record); }} style={{ paddingLeft: '10px' }}>编辑</a>
					</Space>
					<Space size="middle">
						<a onClick={() => { handleDownloadTrain(record.id); }} style={{ paddingLeft: '10px' }}>下载</a>
					</Space>
					<Space size="middle">
						<a onClick={() => { handleDeleteTrain(record.id); }} style={{ color: 'red', paddingLeft: '10px' }}>删除</a>
					</Space>
				</>
			),
		},
	];

	const modalColumns: ColumnsType<DataType> = [
		{
			title: '文件名称',
			dataIndex: 'name',
			key: 'name',
			width: 300,
			// render: (text) => <a>{text}</a>,
		},
		{
			title: '创建时间',
			dataIndex: 'createdTime',
			key: 'createdTime',
			width: 180,
		},
		{
			title: '上传状态',
			dataIndex: 'category',
			key: 'category',
			width: 150,
			render: (_, record: any) => (
				<span>{record.status || '默认'}</span>
			),
		},
		{
			title: '操作',
			key: 'action',
			width: 100,
			render: (_, record: any) => (
				<>
					<Space size="middle">
						<a onClick={() => { handleDeleteDocument(record.id); }} style={{ color: 'red', paddingLeft: '10px' }}>删除</a>
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
		fetchTrainData(pageInfo, formValues);
	};

	const handleAddTrainOk = () => {
		console.log('formInModal value', formInModal.getFieldsValue());
		const {trainName, epochNumber} = formInModal.getFieldsValue();
		const params = {
			name: trainName,
			trainParameter: {
				epochNumber,
			}
		};

		// const { id = '' } = currentRecord;

		if (actionType === 'add') {
			addTrain(params).then((res: any) => {
				console.log('新建训练res', res);
				message.success('新建训练成功');
				setTrainModalShow(false);
				setDocumentData([]);
				const pageInfo = {
					page: 1,
					size: 10,
				};
				formInModal.resetFields();
				fetchTrainData(pageInfo, null);
			}).catch((error) => {
				console.log(error);
			});
		} else {
			// updateCustomQa(id, params).then(res => {
			// 	console.log('定制QAres', res);
				message.success('修改训练成功');
				setTrainModalShow(false);
				setDocumentData([]);
				const pageInfo = {
					page: 1,
					size: 10,
				};
				formInModal.resetFields();
				fetchTrainData(pageInfo, null);
			// }).catch((error) => {
			// 	console.log(error);
			// });
		}
	}

	// const startUpload = () => {
	// 	const params = {
	// 		fileList: fileList[0],
	// 	};
	// 	uploadTrainDocument(params).then(() => {
	// 		//
	// 	}).catch(error => {
	// 		console.log('上传文件失败', error);
	// 	});
	// }

	const modalTableData = actionType === 'add' ? documentData : currentRecord.files;

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
					<Form.Item name="createTime" label="创建时间">
						<DatePicker />
					</Form.Item>
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
				<Button type="link"
					icon={<PlusOutlined />}
					onClick={() => { handleUpdateTrain('add', null); }}
				>
					新建训练
				</Button>
			</div>
			<div className="common-box">
				<Table
					bordered
					columns={columns}
					dataSource={trainData}
					rowKey={(record: any) => record.id}
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
			</div>
			<Modal
				title={actionType === 'add' ? '新建训练' : '编辑训练'}
				open={trainModalShow}
				onCancel={() => { setTrainModalShow(false); }}
				onOk={handleAddTrainOk}
				width={660}
				className='create-train-modal'
			>
				<div style={{ paddingTop: '10px' }}>
					<Form
						form={formInModal}
						name="control-ref"
						// onFinish={onAddQaFinish}
					>
						<Form.Item name="trainName" label="训练名称">
							<Input placeholder='请输入训练名称' />
						</Form.Item>
						<div className='btn-area'>
							<Upload {...uploadProps}>
								<Button type="link" icon={<UploadOutlined />}>
									选择文档
								</Button>
							</Upload>
							{/* {
								fileList.length > 0 && (
									<Button type="primary" size='small' onClick={startUpload} className='upload-btn'>
										开始上传
									</Button>
								)
							} */}
						</div>
						<div className='table-area'>
							<Table
								bordered
								columns={modalColumns}
								dataSource={modalTableData}
								rowKey={(record: any) => record.id}
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
							<InputNumber placeholder='请输入训练轮数' />
						</Form.Item>
					</Form>
				</div>
			</Modal>
		</div>
	);
};

export default TrainList;
