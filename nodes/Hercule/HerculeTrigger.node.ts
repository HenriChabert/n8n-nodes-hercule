import {
	INodeType,
	INodeTypeDescription,
	IHookFunctions,
	IWebhookFunctions,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';
import { HerculeApi } from './GeneralFunctions';

export class HerculeTrigger implements INodeType {
	description: INodeTypeDescription = {
		credentials: [
			{
				name: 'herculeApi',
				required: true,
				displayOptions: {
					show: {},
				},
			},
		],
		displayName: 'Hercule Trigger',
		defaults: {
			name: 'Hercule Trigger',
		},
		description: 'Fill the last mile between your web extension and n8n',
		group: ['trigger'],
		icon: 'file:hercule.svg',
		name: 'herculeTrigger',
		outputs: ['main'],
		version: 1,
		subtitle: '',
		inputs: [],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhooks',
				responseData: '{ "status": "success", "action": {} }',
			},
		],
		properties: [
			{
				displayName: 'Trigger On',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Trigger Manually In Popup',
						value: 'manual_trigger_in_popup',
						description: 'Triggers when a button is clicked',
					},
					{
						name: 'Page Opened',
						value: 'page_opened',
						description: 'Triggers when the page is opened',
					},
					{
						name: 'Button Clicked',
						value: 'button_clicked',
						description:
							'Triggers when a button is clicked (Button should be inserted in the page)',
					},
				],
				default: 'manual_trigger_in_popup',
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
						displayName: 'URL Regex',
						name: 'urlRegex',
						type: 'string',
						default: '.*',
						description: 'The regex to filter the URL',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const triggerId = webhookData?.webhookId as string | undefined;

				if (!triggerId) {
					return false;
				}

				const triggerExists = await HerculeApi.doesTriggerExist(this, triggerId);

				return triggerExists;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const workflow = this.getWorkflow();

				const workflowName = workflow.name || `Untitled Workflow (${workflow.id})`;
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const mode = this.getMode();

				const event = this.getNodeParameter('event') as string;
				const additionalFields = this.getNodeParameter('additionalFields') as IDataObject;

				const urlRegex = additionalFields.urlRegex as string;

				let triggerName = workflowName;

				if (mode === 'manual') {
					triggerName = `${workflowName} (Test)`;
				}

				try {
					const trigger = await HerculeApi.createTrigger(this, {
						name: triggerName,
						event: event,
						webhookUrl,
						urlRegex,
					});

					webhookData.webhookId = trigger.id;
					return true;
				} catch (err) {
					return false;
				}
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const triggerId = webhookData?.webhookId as string | undefined;

				if (!triggerId) {
					return false;
				}

				delete webhookData.webhookId;

				return await HerculeApi.deleteTrigger(this, triggerId);
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		// The data to return and so start the workflow with
		const bodyData = this.getBodyData();

		return {
			workflowData: [this.helpers.returnJsonArray(bodyData)],
		};
	}
}
