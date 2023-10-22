// /* eslint-disable @typescript-eslint/no-unsafe-argument */
// /* eslint-disable @typescript-eslint/no-unsafe-call */
// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-var-requires */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */

// import puppeteer from "puppeteer-extra";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";

// const headersToRemove: string[] = [
//   "host",
//   "user-agent",
//   "accept",
//   "accept-encoding",
//   "content-length",
//   "forwarded",
//   "x-forwarded-proto",
//   "x-forwarded-for",
//   "x-cloud-trace-context",
// ];

// export const scrapeWebsite = async (
//   url: string
// ): Promise<string | undefined> => {
//   try {
//     puppeteer.use(StealthPlugin());

//     let responseBody;
//     let responseData;
//     let responseHeaders;

//     const browser = await puppeteer.launch({ headless: true, ignoreHTTPSErrors: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
//     const page = await browser.newPage();

//     console.log("Setting up page: ", page);
//     console.log("---------------------------------");

//     const client = await page.target().createCDPSession();

//     console.log("Setting up client: ", client);
//     console.log("---------------------------------");

//     await client.send('Network.setRequestInterception', {
//         patterns: [{
//             urlPattern: '*',
//             resourceType: 'Document',
//             interceptionStage: 'HeadersReceived'
//         }],
//     });

//     client.on('Network.requestIntercepted', async e => {
//         const obj = { interceptionId: e.interceptionId };
//         if (e.isDownload) {
//             await client.send('Network.getResponseBodyForInterception', {
//                 interceptionId: e.interceptionId
//             }).then((result) => {
//                 if (result.base64Encoded) {
//                     responseData = Buffer.from(result.body, 'base64');
//                 }
//             });
//             obj['errorReason'] = 'BlockedByClient';
//             responseHeaders = e.responseHeaders;
//         }
//         await client.send('Network.continueInterceptedRequest', obj);
//         if (e.isDownload)
//             await page.close();
//     });

//     console.log("Setting up headers: ", headersToRemove);
//     console.log("---------------------------------");


//     const headers: Record<string, string> = {};
//     headersToRemove.forEach((header) => {
//       headers[header] = "";
//     });

//     console.log("Setting up extra headers: ", headers);
//     console.log("---------------------------------");

//     await page.setExtraHTTPHeaders(headers);

//     console.log("Scraping website:", url);

//     try {
//         let response;
//         let tryCount = 0;

//         console.log("---------------------------------");

//         response = await page.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' });

//         console.log("Response status code:", response?.status());

//         responseBody = await response?.text();
//         responseData = await response?.buffer();
//         while (responseBody?.includes("challenge-running") && tryCount <= 10) {
//             const newResponse = await page.waitForNavigation({ timeout: 30000, waitUntil: 'domcontentloaded' });
//             if (newResponse) response = newResponse;
//             responseBody = await response?.text();
//             responseData = await response?.buffer();
//             tryCount++;
//         }
//         responseHeaders = response?.headers();
//         const cookies = await page.cookies();
//         if (cookies)
//             cookies.forEach(cookie => {
//                 const { name, value, secure, expires, domain, ...options } = cookie;
//                 ctx.cookies.set(cookie.name, cookie.value, options);
//             });
//     } catch (error) {
//         if (!error.toString().includes("ERR_BLOCKED_BY_CLIENT")) {
//             console.error("Error occurred while scraping the website:", error);
//             return undefined;
//         }
//     }

//     await page.close();
//     await browser.close();

//     return responseData;
//   } catch (error) {
//     console.error("Error occurred while scraping the website:", error);
//     return undefined;
//   }
// };
