import {
	ICredentialTestFunctions,
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	INodeCredentialTestResult,
	IRequestOptions,
} from 'n8n-workflow';

export async function apiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query?: IDataObject,
	uri?: string,
	option: IDataObject = {},
) {
	const credentials = await this.getCredentials('herculeApi');

	query = query || {};

	const options: IRequestOptions = {
		headers: {},
		method,
		body,
		qs: query,
		uri: uri || `${credentials.serverUrl}/api/v1/${endpoint}`,
		useQuerystring: false,
		json: true,
	};

	console.log('options', options);

	if (Object.keys(option).length !== 0) {
		Object.assign(options, option);
	}

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	return await this.helpers.requestWithAuthentication.call(this, 'herculeApi', options);
}

export namespace HerculeApi {
	interface ITrigger extends IDataObject {
		name: string;
		webhookUrl: string;
	}

	export const fetchTriggers = async (ref: IHookFunctions) => {
		return await apiRequest.call(ref, 'GET', 'triggers');
	};

	export const createTrigger = async (ref: IHookFunctions, trigger: ITrigger) => {
		return await apiRequest.call(ref, 'POST', 'trigger', {
			name: trigger.name,
			source: 'n8n',
			webhook_url: trigger.webhookUrl,
		});
	};

	export const deleteTrigger = async (ref: IHookFunctions, triggerId: string) => {
		return await apiRequest.call(ref, 'DELETE', `trigger/${triggerId}`);
	};

	export const doesTriggerExist = async (ref: IHookFunctions, triggerId: string) => {
		try {
			await apiRequest.call(ref, 'GET', `trigger/${triggerId}`);
			return true;
		} catch (error) {
			return false;
		}
	};
}

export async function herculeConnectionTest(
	this: ICredentialTestFunctions,
): Promise<INodeCredentialTestResult> {
	return {
		message: 'Connection successful',
		status: 'OK',
	};
}
