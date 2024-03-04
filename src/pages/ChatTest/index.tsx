import {  Button, Input, Space, Form, TreeSelect } from 'antd';
import React, { useState, useEffect } from 'react';
import { getTextData, getCategoryData } from '@/services/aikb/api';
import type { FormInstance } from 'antd/es/form';
import { useForm } from 'antd/es/form/Form';
import { arrayToTreeLoop } from '@/utils'
import './index.less';

const ChatTest: React.FC = () => {
	const formRef = React.useRef<FormInstance>(null);
	const [form] = useForm();

	const [treeData, setTreeData] = useState([]);
	const [chatList, setChatList] = useState([]);
	const [searchText, setSearchText] = useState('');
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

	const handleInputChange = (e: any) => {
		setSearchText(e.target.value);
	}

	const getSearchAnswer = () => {
		const params = {
			text: searchText,
			documentIds: [],
		};

		getTextData(params).then(res => {
			console.log('文本搜索res', res);
		}).catch((error) => {
			console.log(error);
		});
	}

	const onFinish = (formValues: any) => {
		getSearchAnswer();
	};

	const onTreeChange = (newTreeValue: string) => {
		setSelectedCategory(newTreeValue);
	};

	return (
		<div className="chattest-page">
			{/* <Breadcrumb itemRender={itemRender} items={items} />; */}
			<h1>对话测试</h1>
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
						<Input />
					</Form.Item>
					<Form.Item name="categoryName" label="类目">
					<TreeSelect
						showSearch
						// style={{ width: 166, marginRight: 40 }}
						value={selectedCategory}
						dropdownStyle={{ maxHeight: 400, overflow: 'auto', width: 'auto' }}
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
			<div className="common-box">
				<div className="mesage-box">
					{
						chatList.map((item: any, index: number) => item.type === 'ask' ? (
							<div className="ask-item" key={index}>
								<div className="message-item">问：{item.text}？</div>
							</div>
						) : (
							<div className="answer-item" key={index}>
								<div className="message-item">答：{item.text}</div>
							</div>
						))
					}
					
				</div>
				<Space.Compact style={{ width: '100%' }}>
					<Input placeholder="请输入问题" onChange={handleInputChange} />
					<Button type="primary" onClick={getSearchAnswer}>发送</Button>
				</Space.Compact>
			</div>
		</div>
	);
};

export default ChatTest;
