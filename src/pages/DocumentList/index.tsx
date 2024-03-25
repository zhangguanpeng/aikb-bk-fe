import { Form, Button, Input, message, Space, Table, Upload, TreeSelect } from 'antd';
import {
	getDocumentData, deleteDocument, uploadDocument, getCategoryData
} from '@/services/aikb/api';
import type { UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useForm } from 'antd/es/form/Form';
import React, { useState, useEffect } from 'react';
import type { FormInstance } from 'antd/es/form';
import { arrayToTreeLoop } from '@/utils'
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
	category: {
		id: string, // 类目id
		name: string // 类目名称
	}
}

// const formItemLayout = { labelCol: { span: 4 }, wrapperCol: { span: 14 } };

const DocumentList: React.FC = () => {
	const formRef = React.useRef<FormInstance>(null);
	const [form] = useForm();
	
	const [treeData, setTreeData] = useState([]);
	const [documentData, setDocumentData] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [selectedCategory, setSelectedCategory] = useState('');

	const fetchCategoryData = () => {
		getCategoryData().then(res => {
			console.log('类目列表res', res);
			const treeData = arrayToTreeLoop(res.payload);
			// console.log('接口treeData', treeData);
			//@ts-ignore
			setTreeData(treeData);
		}).catch((error: any) => {
			console.log(error);
		});
	}

	useEffect(() => {
		fetchCategoryData();
	}, []);

	const fetchDocumentData = (pageInfo: any, formValues: any) => {
		const {documentName = '', category = ''} = formValues || form.getFieldsValue();
		console.log('formValues', formValues);
		const params = {
			id: category,
			name: documentName,
			page: pageInfo.page,
			size: pageInfo.size,
			sort: 'createdDate,desc'
		};
		getDocumentData(params).then(res => {
			console.log('文档列表res', res);
			setDocumentData(res.payload);
			setTotal(res.totalElements);
		}).catch((error) => {
			console.log(error);
		});
	}

	const props: UploadProps = {
		name: 'file',
		// action: '/aikb/v1/doc/upload',
		// onChange(info) {
		// 	if (info.file.status !== 'uploading') {
		// 		console.log(info.file, info.fileList);
		// 	}
			
		// 	if (info.file.status === 'done') {
		// 		const params = {
		// 			categoryId: 1,
		// 			documentList: info.fileList[0].originFileObj,
		// 		};
		// 		uploadDocument(params).then(() => {
		// 			message.success(`${info.file.name} 上传成功`);
		// 			const pageInfo = {
		// 				page: 1,
		// 				size: 10,
		// 			};
		// 			fetchDocumentData(pageInfo, null);
		// 		}).catch(() => {
		// 			message.error(`${info.file.name} 上传失败.`);
		// 		});
		// 	} else if (info.file.status === 'error') {
		// 		message.error(`${info.file.name} 上传失败.`);
		// 	}
		// },
		customRequest(info: any) {
			console.log('upload info', info);

			const params = {
				categoryId: selectedCategory,
				documentList: info.file,
			};
			uploadDocument(params).then(() => {
				message.success(`${info.file.name} 上传成功`);
				const pageInfo = {
					page: 1,
					size: 10,
				};
				fetchDocumentData(pageInfo, null);
			}).catch(() => {
				message.error(`${info.file.name} 上传失败.`);
			});
		},
		maxCount: 50,
		showUploadList: false,
		multiple: true,
	};

	const handlePageChange = (page: number, pageSize: number) => {
		console.log(page);
		setCurrentPage(page);
		const pageInfo = {
			page,
			size: pageSize,
		};
		fetchDocumentData(pageInfo, null);
	};

	// const downloadFile = (filestream: any, fileName: string) => {
	// 	//fileName : 设置下载的文件名称
	// 	//filestream: 返回的文件流
	// 	const blob = new Blob([filestream], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
	// 	// const blob = new Blob([filestream]);
	// 	const a = document.createElement('a');
	// 	const href = window.URL.createObjectURL(blob); // 创建下载连接
	// 	a.href = href;
	// 	a.download = decodeURI(fileName );
	// 	document.body.appendChild(a);
	// 	a.click();
	// 	document.body.removeChild(a); // 下载完移除元素
	// 	window.URL.revokeObjectURL(href); // 释放掉blob对象
	// };

	const downloadFile = (url: string) => {
		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		// a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	const handleDownloadFile = (id: string) => {
		downloadFile(`/aikb/v1/doc/download?id=${id}`);
	}

	const handleDeleteFile = (id: string) => {
		deleteDocument(id).then(() => {
			message.success('文件删除成功');
			const pageInfo = {
				page: 1,
				size: 10,
			};
			fetchDocumentData(pageInfo, null);
		}).catch(() => {
			message.error('文件删除失败');
		});
	};

	useEffect(() => {
		const pageInfo = {
			page: 1,
			size: 10,
		};
		fetchDocumentData(pageInfo, null);
	}, []);

	const columns: ColumnsType<DataType> = [
		{
			title: '文档名称',
			dataIndex: 'name',
			key: 'name',
			width: 350,
			render: (text) => <a>{text}</a>,
		},
		{
			title: '类目名称',
			dataIndex: 'category',
			key: 'category',
			width: 90,
			render: (_, record) => (
				<span>{record.category.name || '默认'}</span>
			),
		},
		{
			title: '分片数',
			dataIndex: 'splitCount',
			key: 'splitCount',
			width: 90,
		},
		{
			title: '分片状态',
			dataIndex: 'splitStatus',
			key: 'splitStatus',
			width: 90,
		},
		{
			title: '文件大小',
			dataIndex: 'fileSize',
			key: 'fileSize',
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
						<a onClick={() => { handleDownloadFile(record.id) }}>下载</a>
					</Space>
					<Space size="middle">
						<a onClick={() => { handleDeleteFile(record.id); }} style={{ color: 'red', paddingLeft: '10px' }}>删除</a>
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
		fetchDocumentData(pageInfo, formValues);
	};

	const onTreeChange = (newTreeValue: string) => {
		setSelectedCategory(newTreeValue);
	};

	return (
		<div className="category-page">
			<h1>文档管理</h1>
			<div className="common-box query-box">
				<Form
					// {...formItemLayout}
					layout="inline"
					ref={formRef}
					form={form}
					name="control-ref"
					onFinish={onFinish}
				>
					<Form.Item name="documentName" label="文档名称">
						<Input style={{ width: 200 }} />
					</Form.Item>
					<Form.Item name="category" label="类目">
						<TreeSelect
							showSearch
							style={{ width: 200 }}
							value={selectedCategory}
							dropdownStyle={{ maxHeight: 400, overflow: 'auto', width: 200 }}
							placeholder="请选择"
							allowClear
							treeDefaultExpandAll
							onChange={onTreeChange}
							treeData={treeData}
						/>
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
				<Upload {...props}>
					<Button type="link" icon={<UploadOutlined />}>
						上传文档
					</Button>
				</Upload>
			</div>
			<div className="common-box">
				<Table
					bordered
					columns={columns}
					dataSource={documentData}
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
		</div>
	);
};

export default DocumentList;
