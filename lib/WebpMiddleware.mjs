/**
 * WEBP Middleware
 *
 * @author Anton Desin anton.desin@gmail.com
 * @copyright (c) Anton Desin | Интернет-агентство IT People
 * @link https://itpeople.ru/
 */

import http2 from 'http2';
import mime from 'mime-types';
import path from 'path';
import fs from "fs";
import {execFileSync} from 'child_process';
import cwebp from 'cwebp-bin';

const serverName = 'itpeople';

const defaults = {
  mimeTypes: [
    'image/jpeg',
    'image/png',
    'image/tiff'
  ],
  serveImages: true,
  cachePath: path.resolve(process.cwd(), 'cache'),
  cwebpOptions: [],
};

const acceptType = 'image/webp';

export default class WebpMiddleware {

  /**
   * Метод возвращает функцию Middleware
   * @param publicPath Путь к директории с файлами, которые раздаёт сервер
   * @param options Настройки
   * @returns {Function} Функция Middleware. Поддерживается Express
   */
  create(publicPath, options = {}) {
    this.publicPath = publicPath;
    this.options = Object.assign({}, defaults, options);

    return (request, response, next) => {
      if (this.__isSupportsWebp(request) && this.__checkMimeTypes(request)) {
        const reqPath = request.headers[http2.constants.HTTP2_HEADER_PATH];
        const srcPath = path.resolve(this.publicPath, '.' + reqPath);
        const webpUrl = reqPath + '.webp';
        const destPath = path.resolve(this.options.cachePath, '.' + webpUrl);

        if (!fs.existsSync(destPath)) {
          this.__createWebp(srcPath, destPath);
        }
        if(this.options.serveImages === true){
          this.__respondFile(request, response, destPath);
        }else{
          request.headers[http2.constants.HTTP2_HEADER_PATH] = webpUrl;
          next();
        }
      }else{
        next();
      }
    };
  }

  /**
   * Метод создаёт файл webp
   * @param src Абсолютный путь к файлу-источнику
   * @param dest Абсолютный путь к итоговому файлу webp
   * @private
   */
  __createWebp(src, dest) {
    //fs.mkdirSync(path[, options])
    const destDir = path.dirname(dest);
    if(!fs.existsSync(destDir)){
      fs.mkdirSync(destDir, {recursive: true});
    }
    const resCWebp = execFileSync(cwebp, [...this.options.cwebpOptions, src, '-o', dest]);
    //console.log(resCWebp);
  }

  /**
   * Метод отдаёт файл
   * @param request HTTP/2 request
   * @param response HTTP/2 response
   * @param filePath Путь к файлу
   * @private
   */
  __respondFile(request, response, filePath){
    const responseMimeType = mime.lookup(filePath);
    const stat = fs.lstatSync(filePath);

    let resHeaders = {
      'accept-range': 'bytes',
      'content-length': stat.size,
      'last-modified': stat.mtime.toUTCString(),
      'content-type': responseMimeType,
      [http2.constants.HTTP2_HEADER_SERVER]: serverName
    };

    let resOptions = {
      onError: (err) => {
        // ToDo: Хз, тут потом сделаю что-нибудь нормальное
        if (err.code === 'ENOENT') {
          response.stream.respond({ [http2.constants.HTTP2_HEADER_STATUS]: 404, [http2.constants.HTTP2_HEADER_SERVER]: serverName });
        } else {
          response.stream.respond({ [http2.constants.HTTP2_HEADER_STATUS]: 500, [http2.constants.HTTP2_HEADER_SERVER]: serverName });
        }
        response.stream.end();
      }
    };
    response.stream.respondWithFile(filePath, resHeaders, resOptions);
  }

  /**
   * Метод проверяет, можно ли конвертнуть файл в webp (по mime-nипам)
   * @param request HTTP/2 request
   * @returns {boolean}
   * @private
   */
  __checkMimeTypes(request) {
    const reqPath = request.headers[http2.constants.HTTP2_HEADER_PATH];
    const mimeType = mime.lookup(reqPath);
    return this.options.mimeTypes.indexOf(mimeType) !== -1;
  }

  /**
   * Метод проверяет, поддерживает ли браузер формат webp
   * @param request HTTP/2 request
   * @returns {boolean}
   * @private
   */
  __isSupportsWebp(request) {
    return typeof request.headers.accept !== 'undefined' && request.headers.accept.indexOf(acceptType) !== -1;
  }
}