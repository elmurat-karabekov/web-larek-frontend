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
		try {
			const data = await this.baseApi.get<ApiListResponse<IProduct>>(
				'/product'
			);
			return data.items.map((product) => ({
				...product,
				image: this.cdn + product.image,
			}));
		} catch (error) {
			console.error('Error fetching products:', error);
			return [];
		}
	}

	async orderProducts(order: IOrder): Promise<IOrderResult> {
		try {
			return await this.baseApi.post<IOrderResult>('/order', order, 'POST');
		} catch (error) {
			console.error('Error placing order:', error);
		}
	}
}
