import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
const Creators = () => {
  const router = useRouter();
  const { id } = router.query;
  console.log(id);

  return (
    <>
      <Head>
        <title>{id?.substr(0, 4) + "..." + id?.substr(id?.length - 4)}</title>
      </Head>
    </>
  );
};

export default Creators;
