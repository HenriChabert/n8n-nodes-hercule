import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';
import axios from 'axios';

interface ILoginResponse {
	token: {
		access_token: string;
		token_type: "bearer";
	};
	user: {
		id: string;
		email: string;
		role: "user" | "admin";
	};
}

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
			displayName: 'Admin Email',
			name: 'adminEmail',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Admin Password',
			name: 'adminPassword',
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
		const { adminEmail, adminPassword } = credentials;

		const loginResponse = await axios<ILoginResponse>({
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			data: {
				email: adminEmail,
				password: adminPassword,
			},
			method: 'POST',
			url: `${credentials.serverUrl}/api/v1/auth/login`,
		});

		if (loginResponse.status !== 200) {
			throw new Error('Invalid credentials');
		}

		const { user, token } = loginResponse.data;

		if (user.role !== 'admin') {
			throw new Error('Invalid credentials. User is not an admin');
		}

		if (requestOptions.headers) {
			delete requestOptions.auth;
			Object.assign(requestOptions.headers, {
				"Authorization": `Bearer ${token.access_token}`
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
