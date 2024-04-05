import axios from 'axios';
import packageInfo from '../../package.json';

export default axios.create({
  baseURL: `http://localhost:${packageInfo.expressPort}`,
});
