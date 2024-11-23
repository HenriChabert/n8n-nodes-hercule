import type { IExecuteFunctions, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { herculeConnectionTest } from './GeneralFunctions';

export class Hercule implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Hercule',
		name: 'hercule',
		icon: 'file:hercule.svg',
		group: ['transform'],
		version: 1,
		description: 'Make your browser extension talk to n8n',
		defaults: {
			name: 'Hercule',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'herculeApi',
				required: true,
				testedBy: 'herculeConnectionTest',
			},
		],
		properties: [],
	};

	methods = {
		credentialTest: { herculeConnectionTest },
	};

	async execute(this: IExecuteFunctions) {
		const items = this.getInputData();

		return [items];
	}
}
