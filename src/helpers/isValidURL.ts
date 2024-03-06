export function isValidURL(input: string): boolean {

    console.log("isValidURL input: ", input);

  const urlPattern = new RegExp(
    "^(ftp|http|https)://[^\\s/$.?#].[^\\s]*$",
    "i"
  );

  console.log("isValidURL urlPattern.test(input): ", urlPattern.test(input));

  return urlPattern.test(input);
}
