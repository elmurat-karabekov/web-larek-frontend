import { HttpMethods, IApi } from '../../types';
export class Api implements IApi {
	readonly baseUrl: string;
	protected _options: RequestInit;

	constructor(baseUrl: string, options: RequestInit = {}) {
		this.baseUrl = baseUrl;
		this._options = {
			headers: {
				'Content-Type': 'application/json',
				...((options.headers as object) ?? {}),
			},
		};
	}

	protected _handleResponse<T>(response: Response): Promise<T> {
		if (response.ok) return response.json();
		else
			return response
				.json()
				.then((data) => Promise.reject(data.error ?? response.statusText));
	}

	async get<T>(uri: string) {
		const response = await fetch(this.baseUrl + uri, {
			...this._options,
			method: 'GET',
		});
		return this._handleResponse<T>(response);
	}

	async post<T>(uri: string, data: object, method: HttpMethods = 'POST') {
		const response = await fetch(this.baseUrl + uri, {
			...this._options,
			method,
			body: JSON.stringify(data),
		});
		return this._handleResponse<T>(response);
	}
}
