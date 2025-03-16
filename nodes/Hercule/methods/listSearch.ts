import type {
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';
import { HerculeApi } from '../GeneralFunctions';

export async function listOnButtonClickedTriggers(
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
}
