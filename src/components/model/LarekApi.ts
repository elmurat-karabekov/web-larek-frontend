import {
	ILarekApi,
	IProduct,
	ApiListResponse,
	IOrder,
	IOrderResult,
	IApi,
} from '../../types';

export class LarekApi implements ILarekApi {
	private baseApi: IApi;
	readonly cdn: string;

	constructor(baseApi: IApi, cdn: string) {
		this.baseApi = baseApi;
		this.cdn = cdn;
	}

	async getProducts(): Promise<IProduct[]> {
		const data = await this.baseApi.get<ApiListResponse<IProduct>>('/product');
		return data.items.map((product) => ({
			...product,
			image: this.cdn + product.image,
		}));
	}

	async orderProducts(order: IOrder): Promise<IOrderResult> {
		return await this.baseApi.post<IOrderResult>('/order', order, 'POST');
	}
}
