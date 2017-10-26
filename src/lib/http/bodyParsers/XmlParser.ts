import IBodyParser from "./../../types/http/IBodyParser";
import IHttpHandler from "./../../types/http/IHttpHandler";
import parserHelper from "./parserHelper";

// Changes String to XML
const xmlToJsonFromString = (initialBody: string, contentType: string): { [name: string]: any } => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(initialBody, contentType || "text/xml");

  return xmlToJson(xml);
}

// Changes XML to JSON
const xmlToJson = (xml): { [name: string]: any } => {
	// Create the return object
	var obj = {};

	if (xml.nodeType == 1) { // element
		// do attributes
		if (xml.attributes.length > 0) {
		obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) { // text
		obj = xml.nodeValue;
	}

	// do children
	if (xml.hasChildNodes()) {
		for(var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof(obj[nodeName]) == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof(obj[nodeName].push) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};

/**
 * A layer that set the request body depending of its type.
 */
export default class XmlParser implements IBodyParser {

  public create(): IHttpHandler {
    return parserHelper(xmlToJsonFromString);
  }

}
