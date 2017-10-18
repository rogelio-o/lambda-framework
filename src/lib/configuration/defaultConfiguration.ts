import { generate } from "randomstring";
import configuration from "./configuration";

/**
 * The default configurations values.
 */
const defaultConfiguration = {};
defaultConfiguration[configuration.DEFAULT_MYME_TYPE] = "application/json;charset=UTF-8";
defaultConfiguration[configuration.ENVIRONMENT] = "development";
defaultConfiguration[configuration.TRUST_PROXY] = false;
defaultConfiguration[configuration.COOKIE_SECRET] = generate();
defaultConfiguration[configuration.JSON_REPLACER] = undefined;
defaultConfiguration[configuration.JSON_SPACES] = undefined;
defaultConfiguration[configuration.JSON_ESCAPE] = undefined;

export default defaultConfiguration;
