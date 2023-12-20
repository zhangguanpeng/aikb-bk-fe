import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React from 'react';

const Footer: React.FC = () => {
	const intl = useIntl();
	const defaultMessage = intl.formatMessage({
		id: 'app.copyright.produced',
		defaultMessage: 'AIKB',
	});

	const currentYear = new Date().getFullYear();

	return (
		<DefaultFooter
			style={{
				background: 'none',
			}}
			copyright={`${currentYear} ${defaultMessage}`}
			links={[
				// {
				// 	key: 'Ant Design Pro',
				// 	title: 'Ant Design Pro',
				// 	href: 'https://pro.ant.design',
				// 	blankTarget: true,
				// },
			]}
		/>
	);
};

export default Footer;
