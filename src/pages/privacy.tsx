import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Vayo</title>
        <meta name="description" content="Keeping bookmarks" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-[black]">
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.3 }}
          className="flex w-full max-w-[50rem] flex-col justify-center px-4 py-16"
        >
          <h2 className="pt-4 text-3xl font-bold text-slate-100 transition duration-500">
            Privacy Policy
          </h2>
          <p className=" py-3  text-slate-400 transition duration-500">
            This Privacy Policy describes how Bookmarks collects, uses, and
            discloses personal information when you use the Bookmarks Chrome
            extension (the &quot;service&quot;).
          </p>
          <h2 className="pt-4 text-xl font-bold text-slate-100 transition duration-500">
            Information Collection and Use
          </h2>
          <p className=" py-3  text-slate-400 transition duration-500">
            The service does not collect any personal information from its
            users. We simply fetch your current session from the Chrome API
            (cookies) and use it to fetch your folders and save your bookmarks.
          </p>
          <h2 className="pt-4 text-xl font-bold text-slate-100 transition duration-500">
            Data Security
          </h2>
          <p className=" py-3  text-slate-400 transition duration-500">
            The security of your data is important to us, but please remember
            that no method of transmission over the internet, or method of
            electronic storage is 100% secure. While we strive to use
            commercially acceptable means to protect your personal information,
            we cannot guarantee its absolute security.
          </p>
          <h2 className="pt-4 text-xl font-bold text-slate-100 transition duration-500">
            Changes to This Privacy Policy
          </h2>
          <p className=" py-3  text-slate-400 transition duration-500">
            We may update our Privacy Policy from time to time. Thus, you are
            advised to review this page periodically for any changes. We will
            notify you of any changes by posting the new Privacy Policy on this
            page. These changes are effective immediately after they are posted
            on this page.
          </p>
          <h2 className="pt-4 text-xl font-bold text-slate-100 transition duration-500">
            Contact Us
          </h2>
          <p className=" py-3  text-slate-400 transition duration-500">
            If you have any questions or suggestions about our Privacy Policy,
            do not hesitate to contact us at the{" "}
            <Link className="text-white hover:text-slate-300 trasition duration-300" href={"https://x.com/heyimgustavo"}>
              developer&apos;s Twitter account.
            </Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}
