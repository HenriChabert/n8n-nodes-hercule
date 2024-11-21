import {
	INodeType,
	INodeTypeDescription,
	IHookFunctions,
	NodeConnectionType,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { HerculeApi } from './GeneralFunctions';
import { LoggerProxy as Logger } from 'n8n-workflow';

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
		outputs: [NodeConnectionType.Main],
		version: 1,
		subtitle: '',
		inputs: [],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhooks',
				responseData: '{ "status": "ok" }',
			},
		],
		properties: [
			{
				displayName: 'Trigger On',
				name: 'trigger',
				type: 'multiOptions',
				options: [
					{
						name: 'Button Clicked',
						value: 'button_clicked',
						description: 'Triggers when a button is clicked',
					},
				],
				default: [],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				console.log('Checking if Hercule trigger exists');
				const webhookData = this.getWorkflowStaticData('node');
				console.log('Step 0');
				const triggerId = webhookData?.webhookId as string | undefined;
				console.log('Step 1');

				if (!triggerId) {
					return false;
				}

				console.log('Step 2');
				const triggerExists = await HerculeApi.doesTriggerExist(this, triggerId);
				console.log('Trigger exists:', triggerExists);

				return triggerExists;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				console.log('Creating Hercule trigger');
				const webhookData = this.getWorkflowStaticData('node');
				const workflow = this.getWorkflow();

				const workflowName = workflow.name || `Untitled Workflow (${workflow.id})`;
				const webhookUrl = this.getNodeWebhookUrl('default') as string;

				try {
					console.log('Creating Hercule trigger');
					const trigger = await HerculeApi.createTrigger(this, {
						name: workflowName,
						webhookUrl,
					});
					console.log('Trigger created:', trigger);

					webhookData.webhookId = trigger.id;
					return true;
				} catch (err) {
					return false;
				}
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				console.log('Deleting Hercule trigger');
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
