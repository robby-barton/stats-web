/* istanbul ignore file */

import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		const initialProps = await Document.getInitialProps(ctx);
		return { ...initialProps };
	}

	render() {
		const setInitialTheme = `
			(function () {
				function getUserPreference() {
					if(window.localStorage.getItem('theme')) {
						return window.localStorage.getItem('theme')
					}
					return window.matchMedia('(prefers-color-scheme: dark)').matches 
						? 'dark' 
						: 'light'
				}
				const colorMode = getUserPreference();
				document.body.dataset.theme = colorMode
			})()
		`;
		return (
			<Html>
				<Head />
				<body>
					<script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
