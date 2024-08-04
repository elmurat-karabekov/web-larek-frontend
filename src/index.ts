import { Api } from './components/base/api';
import { LarekApi } from './components/LarekApi';
import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';

const baseApi = new Api(API_URL);
const larekApi = new LarekApi(baseApi, CDN_URL);

console.log(larekApi.getProducts().then((data) => console.log(data)));
