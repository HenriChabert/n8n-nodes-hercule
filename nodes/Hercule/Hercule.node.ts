import type { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { herculeConnectionTest } from './GeneralFunctions';

export class Hercule implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Hercule Actions',
		name: 'hercule',
		icon: 'file:hercule.svg',
		group: ['transform'],
		version: 1,
		description: 'Make your browser extension talk to n8n',
		defaults: {
			name: 'Hercule Actions',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'herculeApi',
				required: true,
				testedBy: 'herculeConnectionTest',
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.serverUrl}}/api/v1',
			headers: {
				'Content-Type': 'application/json',
				'X-Hercule-Auth-Key': '={{$credentials.secretKey}}',
			},
		},
		properties: [
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Show Console',
						value: 'show_console',
						action: 'Show a console message to the user',
					},
					{
						name: 'Show Alert',
						value: 'show_alert',
						action: 'Show an alert to the user',
					},
					{
						name: 'Inject Script',
						value: 'inject_script',
						action: 'Inject a script into the page',
					},
				],
				routing: {
					request: {
						method: 'POST',
						url: '=/webhook-usage/{{$parameter.webhookUsageId}}/callback',
					},
				},
				required: true,
				default: 'show_console',
			},
			{
				displayName: 'Webhook Usage ID',
				name: 'webhookUsageId',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: 'Hello World',
				displayOptions: {
					show: {
						action: ['show_console', 'show_alert'],
					},
				},
				routing: {
					request: {
						body: {
							actions: [
								{
									type: '={{$parameter.action}}',
									params: {
										message: '={{$parameter.message}}',
									},
								},
							],
						},
					},
				},
			},
			{
				displayName: 'Script',
				name: 'script',
				type: 'string',
				default: 'console.log("Hello World");',
				displayOptions: {
					show: {
						action: ['inject_script'],
					},
				},
				routing: {
					request: {
						body: {
							actions: [
								{
									type: '={{$parameter.action}}',
									params: {
										script: '={{$parameter.script}}',
									},
								},
							],
						},
					},
				},
			},
		],
	};

	methods = {
		credentialTest: { herculeConnectionTest },
	};
}
