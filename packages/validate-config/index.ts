import isPlainObject from "lodash.isplainobject";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

function assertExists<T>(
  val: T,
  propName: string
): asserts val is NonNullable<T> {
  if (val === undefined || val === null || Number.isNaN(val)) {
    const msg = `Config variable ${propName} has no value`;
    throw new Error(msg);
  }
}

function validateConfigValue<T>(
  value: T | undefined | null,
  propName: string
): NonNullable<T> {
  const msg = `Config variable ${propName} has no value`;
  assertExists(value, propName);

  if (isPlainObject(value)) return validateConfigObject(value);

  if (
    (typeof value === "string" && value === "") ||
    (typeof value === "number" && value === -1)
  ) {
    throw new Error(msg);
  }

  return value;
}

export default function validateConfigObject<T>(config: T): T {
  let hasErrors = false;
  Object.entries(config).forEach(([key, value]) => {
    try {
      validateConfigValue(value, key);
    } catch (e) {
      if (process.env.CI === "true") {
        console.error(e);
      }
      hasErrors = true;
    }
  });

  if (process.env.CI === "true" && hasErrors) {
    throw new Error("CI Vars are missing, see ci log for details");
  }

  return config;
}
