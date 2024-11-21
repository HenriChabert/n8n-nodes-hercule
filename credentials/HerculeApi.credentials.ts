import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

export class HerculeApi implements ICredentialType {
	name = 'herculeApi';

	displayName = 'Hercule API';

	documentationUrl = 'https://docs.hercule.io/api/';

	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'serverUrl',
			type: 'string',
			default: 'http://127.0.0.1:8000',
		},
		{
			displayName: 'Secret Key',
			name: 'secretKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		requestOptions.auth = {
			// @ts-ignore
			user: credentials.consumerKey as string,
			password: credentials.consumerSecret as string,
		};
		if (requestOptions.headers) {
			delete requestOptions.auth;
			Object.assign(requestOptions.headers, {
				'X-Hercule-Secret-Key': credentials.secretKey,
			});
		}
		return requestOptions;
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: `={{$credentials.serverUrl}}`,
			url: '/api/v1/health-secured',
		},
	};
}
