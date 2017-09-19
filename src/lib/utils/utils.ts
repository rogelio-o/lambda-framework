import contentType from 'content-type';

export function setCharset(type, charset) {
  if (!type || !charset) {
    return type;
  }

  // parse type
  var parsed = contentType.parse(type);

  // set charset
  parsed.parameters.charset = charset;

  // format type
  return contentType.format(parsed);
};

export function merge(...objs: object[]): any {
  const result = {};
  for (let i = 0; i < objs.length; i++) {
    const obj = objs[i]
    for (var key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}
