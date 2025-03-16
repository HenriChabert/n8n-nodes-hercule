import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { HerculeApi, herculeConnectionTest } from './GeneralFunctions';
// import { listSearch } from './methods';

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
										id: '={{$nodeId}}',
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
				displayName: 'Button Anchor CSS Selector',
				name: 'buttonAnchorCssSelector',
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
										anchorCssSelector: '={{$parameter.buttonAnchorCssSelector}}',
									},
								},
							},
						},
					},
				},
			},
			{
				displayName: 'Position To Anchor',
				name: 'positionToAnchor',
				type: 'options',
				options: [
					{
						name: 'First Child',
						value: 'first-child',
						description: 'Button will be inserted as the first child of the anchor element',
					},
					{
						name: 'Last Child',
						value: 'last-child',
						description: 'Button will be inserted as the last child of the anchor element',
					},
					{
						name: 'N-th Child', // eslint-disable-line n8n-nodes-base/node-param-display-name-miscased
						value: 'nth-child',
						description: 'Button will be inserted as the N-th child of the anchor element',
					},
					{
						name: 'Before',
						value: 'before',
						description: 'Button will be inserted before the anchor element',
					},
					{
						name: 'After',
						value: 'after',
						description: 'Button will be inserted after the anchor element',
					},
					{
						name: 'Replace',
						value: 'replace',
						description: 'Button will replace the anchor element',
					},
				],
				default: 'before',
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
								params: { button: { positionToAnchor: '={{$parameter.positionToAnchor}}' } },
							},
						},
					},
				},
			},
			{
				displayName: 'Nth Child Index',
				name: 'nthChildIndex',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						action: ['insert_button'],
						buttonPosition: ['in-content'],
						positionToAnchor: ['nth-child'],
					},
				},
				description:
					'The index of the child to insert the button after. If the index is too high, the button will be inserted as the last child.',
				required: true,
				routing: {
					request: {
						body: {
							action: { params: { button: { nthChildIndex: '={{$parameter.nthChildIndex}}' } } },
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
							action: { params: { buttonAction: '={{$parameter.buttonAction}}' } },
						},
					},
				},
			},
			{
				displayName: 'Trigger',
				name: 'triggerId',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'By ID',
						name: 'list',
						type: 'list',
						placeholder: 'Select a Trigger...',
						typeOptions: {
							searchListMethod: 'listOnButtonClickedTriggers',
							searchable: true,
						},
					},
				],
				displayOptions: {
					show: {
						action: ['insert_button'],
						buttonAction: ['launch_trigger'],
					},
				},
				description: 'The Trigger to launch',
				routing: {
					request: {
						body: {
							action: { params: { triggerId: '={{$parameter.triggerId}}' } },
						},
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				placeholder: 'Add Field',
				description: 'Additional fields to add',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Apply On All CSS Selector Matches',
						name: 'applyOnAllCssSelectorMatches',
						type: 'boolean',
						default: false,
						description:
							'Whether to apply the button to all matches of the CSS selector or only the first one. If false, the button will be inserted only on the first match.',
						routing: {
							request: {
								body: {
									action: {
										params: {
											button: {
												applyOnAllCssSelectorMatches: '={{$value}}',
											},
										},
									},
								},
							},
						},
					},
					{
						displayName: 'Custom HTML',
						name: 'customHtml',
						type: 'string',
						default: '',
						description:
							'By default, the button is a button element. If you want to use a different HTML element, you can use this field to specify the HTML element.',
						routing: {
							request: {
								body: {
									action: {
										params: {
											button: { customHtml: '={{$value}}' },
										},
									},
								},
							},
						},
					},
					{
						displayName: 'Custom CSS',
						name: 'customCss',
						type: 'string',
						default: '',
						description:
							'Assign a custom CSS class to the button. Button class is "hercule-in-content-button". CSS should be written as in a style tag.',
						routing: {
							request: {
								body: {
									action: {
										params: {
											button: { customCss: '={{$value}}' },
										},
									},
								},
							},
						},
					},
					{
						displayName: 'Anchor Custom CSS',
						name: 'anchorCustomCss',
						type: 'string',
						default: '',
						description:
							'Assign a custom CSS class to the anchor element. CSS should be written as inline CSS.',
						routing: {
							request: {
								body: {
									action: {
										params: {
											button: {
												anchorCustomCss: '={{$value}}',
											},
										},
									},
								},
							},
						},
					},
				],
				displayOptions: {
					show: {
						action: ['insert_button'],
						buttonPosition: ['in-content'],
					},
				},
			},
		],
	};

	methods = {
		credentialTest: { herculeConnectionTest },
		listSearch: {
			listOnButtonClickedTriggers: async function (
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const returnData: INodeListSearchItems[] = [];

				const triggers = await HerculeApi.listTriggers(this, 'button_clicked');

				for (const trigger of triggers) {
					returnData.push({
						name: trigger.name,
						value: trigger.id || '',
					});
				}
				returnData.sort((a, b) => {
					if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) {
						return -1;
					}
					if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) {
						return 1;
					}
					return 0;
				});
				return { results: returnData };
			},
		},
	};
}
