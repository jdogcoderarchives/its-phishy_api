/**
 * Swagger Options, used to configure the swagger-ui-express package
 */
export const swaggerOptions = {
	openapi: '3.0.0',
	info: {
		title: 'Its Phishy API',
		version: `${process.env.npm_package_version}`,
		description:
      'The Its Phishy API, is a REST API for the Its Phishy Project. It is used to check if things like URLs, domains, email adresses, and discord users are phishy.',
		termsOfService: 'https://api.itsfishy.xyz/tos',
		license: {
			name: 'Eclipse Public License 2.0 (EPL-2.0)',
			url: 'https://opensource.org/licenses/EPL-2.0',
		},
		contact: {
			name: "It's Phishy Project",
			url: 'itsphishy.xyz',
			email: 'support@itsfishy.xyz',
		},
	},
	basePath: '/',
	tags: [
		{ name: 'Main API Endpoints', description: 'Main API Endpoints' },
		{
			name: 'Authentication Endpoints',
			description: 'Authentication Endpoints',
		},
		{ name: 'Misc Endpoints', description: 'Misc Endpoints' },
	],
	/*     security: {
    BasicAuth: {
      type: 'http',
      scheme: 'basic',
    },
  }, */
	filesPattern: ['../routes/*.ts', '../database/models/*.schema.ts'], // Glob pattern to find your jsdoc files
	swaggerUIPath: '/docs', // SwaggerUI will be render in this url.
	baseDir: __dirname,
	// disable the default tag
	defaultTag: false,
};
