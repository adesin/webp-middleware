/**
 * WEBP Middleware
 *
 * @author Anton Desin anton.desin@gmail.com
 * @copyright (c) Anton Desin | Интернет-агентство IT People
 * @link https://itpeople.ru/
 */

import WebpMiddleware from "./lib/WebpMiddleware";

export default (publicPath, options) => {
  return new WebpMiddleware().create(publicPath, options);
};