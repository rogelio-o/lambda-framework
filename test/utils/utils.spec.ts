import * as Chai from "chai";
import { setCharset, stringify } from "../../src/lib/utils/utils";

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
      birthday: new Date(1980, 10, 10),
      wight: 72.6
    };

    it("should transform an object into a JSON string.", () => {
      Chai.expect(stringify(testObject)).to.be.equals("{\"name\":\"Roger\",\"surname\":\"Garcia & <Garcia>\",\"birthday\":\"1980-11-09T23:00:00.000Z\",\"wight\":72.6}");
    });

    it("should add only the properties in the `replacer` array if it is given.", () => {
      Chai.expect(stringify(testObject, ["name", "surname"])).to.be.equals("{\"name\":\"Roger\",\"surname\":\"Garcia & <Garcia>\"}");
    });

    it("should transform the properties values with the `replacer` function if it is given.", () => {
      const replacer = (key, value) => {
        if (key && key !== "name") {
          return undefined;
        } else if(key === "name") {
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
      + "\n    \"birthday\": \"1980-11-09T23:00:00.000Z\","
      + "\n    \"wight\": 72.6"
      + "\n}");
    });

    it("should add the amount of white spaces indicated by `espacio` in each identation if it is given.", () => {
      Chai.expect(stringify(testObject, null, 2)).to.be.equals("{"
      + "\n  \"name\": \"Roger\","
      + "\n  \"surname\": \"Garcia & <Garcia>\","
      + "\n  \"birthday\": \"1980-11-09T23:00:00.000Z\","
      + "\n  \"wight\": 72.6"
      + "\n}");
    });

    it("should escape <, >, and & characters if escape is true.", () => {
      Chai.expect(stringify(testObject, null, null, true)).to.be.equals("{\"name\":\"Roger\",\"surname\":\"Garcia \\u0026 \\u003cGarcia\\u003e\",\"birthday\":\"1980-11-09T23:00:00.000Z\",\"wight\":72.6}");
    });
  });
});
