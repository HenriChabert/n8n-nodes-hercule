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

export async function listUsersForTrigger(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
	const returnData: INodeListSearchItems[] = [];
	const users = await HerculeApi.listUsers(this);
	for (const user of users) {
		returnData.push({
			name: user.email,
			value: user.id || '',
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

	returnData.unshift({
		name: 'All',
		value: '',
	});

	return { results: returnData };
}
