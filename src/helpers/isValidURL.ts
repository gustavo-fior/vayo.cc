export function isValidURL(input: string): boolean {

  const urlPattern = new RegExp(
    "^(ftp|http|https)://[^\\s/$.?#].[^\\s]*$",
    "i"
  );

  return urlPattern.test(input);
}
