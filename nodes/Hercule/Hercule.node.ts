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
					{
						name: 'Insert Button',
						value: 'insert_button',
						action: 'Insert a button into the page',
					},
				],
				routing: {
					request: {
						method: 'POST',
						url: '=/webhook-usage/{{$parameter.webhookUsageId}}/callback',
						body: {
							action: {
								type: '={{$parameter.action}}',
							},
						},
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
							action: {
								params: {
									message: '={{$parameter.message}}',
								},
							},
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
							action: {
								params: {
									script: '={{$parameter.script}}',
								},
							},
						},
					},
				},
			},
			{
				displayName: 'Button Label',
				name: 'buttonLabel',
				type: 'string',
				default: 'Click me',
				displayOptions: {
					show: {
						action: ['insert_button'],
					},
				},
				routing: {
					request: {
						body: {
							action: {
								params: {
									button: {
										label: '={{$parameter.buttonLabel}}',
									},
								},
							},
						},
					},
				},
			},
			{
				displayName: 'Button Variant',
				name: 'buttonVariant',
				type: 'options',
				options: [
					{
						name: 'Primary',
						value: 'primary',
					},
					{
						name: 'Secondary',
						value: 'secondary',
					},
					{
						name: 'Success',
						value: 'success',
					},
					{
						name: 'Warning',
						value: 'warning',
					},
					{
						name: 'Danger',
						value: 'danger',
					},
				],
				default: 'primary',
				displayOptions: {
					show: {
						action: ['insert_button'],
					},
				},
				routing: {
					request: {
						body: {
							action: {
								params: {
									button: { variant: '={{$parameter.buttonVariant}}' },
								},
							},
						},
					},
				},
			},
			{
				displayName: 'Button Size',
				name: 'buttonSize',
				type: 'options',
				options: [
					{
						name: 'Small',
						value: 'small',
					},
					{
						name: 'Medium',
						value: 'medium',
					},
					{
						name: 'Large',
						value: 'large',
					},
				],
				default: 'medium',
				displayOptions: {
					show: {
						action: ['insert_button'],
					},
				},
				routing: {
					request: {
						body: {
							action: {
								params: {
									button: { size: '={{$parameter.buttonSize}}' },
								},
							},
						},
					},
				},
			},
			{
				displayName: 'Button Position',
				name: 'buttonPosition',
				type: 'options',
				options: [
					{
						name: 'Top Right',
						value: 'top-right',
					},
					{
						name: 'Bottom Right',
						value: 'bottom-right',
					},
					{
						name: 'Bottom Left',
						value: 'bottom-left',
					},
					{
						name: 'Top Left',
						value: 'top-left',
					},
					{
						name: 'In Content',
						value: 'in-content',
					},
				],
				default: 'top-right',
				displayOptions: {
					show: {
						action: ['insert_button'],
					},
				},
				routing: {
					request: {
						body: {
							action: {
								params: {
									button: { position: '={{$parameter.buttonPosition}}' },
								},
							},
						},
					},
				},
			},
			{
				displayName: 'Button Parent CSS Selector',
				name: 'buttonParentCssSelector',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						action: ['insert_button'],
						buttonPosition: ['in-content'],
					},
				},
				required: true,
				routing: {
					request: {
						body: {
							action: {
								params: {
									button: {
										parent_css_selector: '={{$parameter.buttonParentCssSelector}}',
									},
								},
							},
						},
					},
				},
			},
			{
				displayName: 'Button Action',
				name: 'buttonAction',
				type: 'options',
				options: [
					{
						name: 'Launch a Trigger',
						value: 'launch_trigger',
					},
				],
				default: 'launch_trigger',
				displayOptions: {
					show: {
						action: ['insert_button'],
					},
				},
				routing: {
					request: {
						body: {
							action: { params: { button_action: '={{$parameter.buttonAction}}' } },
						},
					},
				},
			},
			{
				displayName: 'Trigger ID',
				name: 'triggerId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						buttonAction: ['launch_trigger'],
					},
				},
				required: true,
				routing: {
					request: {
						body: {
							action: {
								params: { trigger_id: '={{$parameter.triggerId}}' },
							},
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
