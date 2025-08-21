import { Rubik } from "next/font/google";
import { Lalezar } from "next/font/google";

const rubik = Rubik({
  subsets: ["arabic", "latin"],
});

const lalezar = Lalezar({
  weight: "400",
  subsets: ["latin", "arabic"],
});

export { rubik, lalezar };
