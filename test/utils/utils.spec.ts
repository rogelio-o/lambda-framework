/* tslint:disable:no-unused-expression */
import * as Chai from "chai";
import { sign } from "cookie-signature";
import ICookie from "../../src/lib/types/http/ICookie";
import { getCookiesFromHeader, setCharset, stringify } from "../../src/lib/utils/utils";

/**
 * Test for utils.
 */
describe("utils", () => {
  describe("#setCharset", () => {
    it("should return the content type + the charset if a content type and a charset is given.", () => {
      Chai.expect(setCharset("application/json", "utf8")).to.be.equals("application/json; charset=utf8");
    });

    it("should return only the content type if no charset is given.", () => {
      Chai.expect(setCharset("application/json", null)).to.be.equals("application/json");
    });

    it("should return only the null if no content type is given.", () => {
      Chai.expect(setCharset(null, null)).to.be.null;
    });
  });

  describe("#stringify", () => {
    const testObject = {
      name: "Roger",
      surname: "Garcia & <Garcia>",
      wight: 72.6
    };

    it("should transform an object into a JSON string.", () => {
      Chai.expect(stringify(testObject)).to.be.equals("{\"name\":\"Roger\",\"surname\":\"Garcia & <Garcia>\",\"wight\":72.6}");
    });

    it("should add only the properties in the `replacer` array if it is given.", () => {
      Chai.expect(stringify(testObject, ["name", "surname"])).to.be.equals("{\"name\":\"Roger\",\"surname\":\"Garcia & <Garcia>\"}");
    });

    it("should transform the properties values with the `replacer` function if it is given.", () => {
      const replacer = (key, value) => {
        if (key && key !== "name") {
          return undefined;
        } else if (key === "name") {
          return "test";
        } else {
          return value;
        }
      };
      Chai.expect(stringify(testObject, replacer)).to.be.equals("{\"name\":\"test\"}");
    });

    it("should add the string given as `espacio` in each identation if it is given.", () => {
      Chai.expect(stringify(testObject, null, "    ")).to.be.equals("{"
      + "\n    \"name\": \"Roger\","
      + "\n    \"surname\": \"Garcia & <Garcia>\","
      + "\n    \"wight\": 72.6"
      + "\n}");
    });

    it("should add the amount of white spaces indicated by `espacio` in each identation if it is given.", () => {
      Chai.expect(stringify(testObject, null, 2)).to.be.equals("{"
      + "\n  \"name\": \"Roger\","
      + "\n  \"surname\": \"Garcia & <Garcia>\","
      + "\n  \"wight\": 72.6"
      + "\n}");
    });

    it("should escape <, >, and & characters if escape is true.", () => {
      Chai.expect(stringify(testObject, null, null, true)).to.be.equals("{\"name\":\"Roger\",\"surname\":\"Garcia \\u0026 \\u003cGarcia\\u003e\",\"wight\":72.6}");
    });
  });

  describe("#getCookiesFromHeader", () => {
    it("returns an empty object if the `Cookie` header is undefined.", () => {
      Chai.expect(getCookiesFromHeader(undefined, "SECRET")).to.be.empty;
    });

    it("returns an array with each cookie in the `Cookie` header.", () => {
      const cookies: { [name: string]: ICookie } = getCookiesFromHeader("cookie1=value1; cookie2=value2", "SECRET");

      Chai.expect(cookies.cookie1.name).to.be.equal("cookie1");
      Chai.expect(cookies.cookie1.value).to.be.equal("value1");
      Chai.expect(cookies.cookie2.name).to.be.equal("cookie2");
      Chai.expect(cookies.cookie2.value).to.be.equal("value2");
    });

    it("unsigns the value of the signed cookies.", () => {
      const signedValue = "s:" + sign("value", "SECRET");

      const cookies: { [name: string]: ICookie } = getCookiesFromHeader("cookie=" + signedValue, "SECRET");

      Chai.expect(cookies.cookie.value).to.be.equal("value");
    });

    it("parses the value of JSON cookies.", () => {
      const value = {ke1: "value1"};
      const parsedValue = "j:" + JSON.stringify(value);

      const cookies: { [name: string]: ICookie } = getCookiesFromHeader("cookie=" + parsedValue, "SECRET");

      Chai.expect(cookies.cookie.value).to.be.deep.equal(value);
    });

    it("unsigns and then parses the value of signed JSON cookies.", () => {
      const value = {ke1: "value1"};
      const parsedValue = "j:" + JSON.stringify(value);
      const signedValue = "s:" + sign(parsedValue, "SECRET");

      const cookies: { [name: string]: ICookie } = getCookiesFromHeader("cookie=" + signedValue, "SECRET");

      Chai.expect(cookies.cookie.value).to.be.deep.equal(value);
    });
  });
});
