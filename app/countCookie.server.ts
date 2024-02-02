import { createCookie } from "@remix-run/node";

const countCookie = createCookie("count");

export default countCookie;
