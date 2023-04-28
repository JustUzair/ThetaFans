import React from "react";
import { useRouter } from "next/router";
const Creators = () => {
  const router = useRouter();
  const { id } = router.query;
  console.log(id);
  return <></>;
};

export default Creators;
