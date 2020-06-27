module.exports = {
	useTabs: true,
	singleQuote: true,
	quoteProps: 'consistent',
	overrides: [
		{
			files: 'package.json',
			options: {
				useTabs: false,
				tabWidth: 2
			}
		}
	]
};
