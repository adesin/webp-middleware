# Webp Middleware

Middleware генерирует на лету и отдаёт файлы в формате webp из jpg и png, сохраняя структуру директорий. 
* Файл сохраняется в формате image.jpg.webp 
* Имеется поддержка опций cwebp
* Поддерживает Express, работает с сервером HTTP/2
* Middleware написан на ES6


## Установка

```cmd
$ yarn add @itpeople/webp-middleware
```

## Использование

```js
import WebpMiddleware from '@itpeople/webp-middleware';

//  Публичная директория, из которой сервер отдаёт изображения
const publicPath = path.resolve(process.cwd(), 'public');

//  Опции
const options = {
  serveImages: true,
  cachePath: path.resolve(process.cwd(), 'cache'),
  cwebpOptions: ['-q  50'],
};

app.use(WebpMiddleware(publiPath, options));
```

## Опции

* **serveImages**: Если true - будет сам отдавать изображения, если false - заменит адрес в заголовке :path. **Boolean**, по-умолчанию **true**;
* **cachePath**: Директория, в которую сохраняются изображения. **String**, по умолчанию **path.resolve(process.cwd(), 'cache')**;
* **cwebpOptions**: Аргументы для утилиты cwebp. **Массив**;