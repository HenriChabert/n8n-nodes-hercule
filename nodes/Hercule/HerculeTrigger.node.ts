import {
	INodeType,
	INodeTypeDescription,
	IHookFunctions,
	IWebhookFunctions,
	IWebhookResponseData,
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
				responseData:
					'{ "status": "success", "actions": [{"type": "show_console", "params": {"message": "Hello, world!"}}] }',
			},
		],
		properties: [
			{
				displayName: 'Trigger On',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Button Clicked',
						value: 'button_clicked',
						description: 'Triggers when a button is clicked',
					},
					{
						name: 'Page Opened',
						value: 'page_opened',
						description: 'Triggers when a button is clicked',
					},
				],
				default: 'button_clicked',
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

				let triggerName = workflowName;

				if (mode === 'manual') {
					triggerName = `${workflowName} (Test)`;
				}

				try {
					const trigger = await HerculeApi.createTrigger(this, {
						name: triggerName,
						event: event,
						webhookUrl,
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
